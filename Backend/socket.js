const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const logger = require('./utils/logger');

let io;

module.exports = {
  init: (httpServer, allowedOrigins) => {
    io = new Server(httpServer, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Authenticate socket connection — look up user from DB so we have activeRole
    io.use(async (socket, next) => {
      const authHeader = socket.handshake.auth.token || socket.handshake.headers.authorization;
      if (!authHeader) {
        return next(new Error('Authentication error: No token provided'));
      }

      const token = authHeader.split(' ')[1] || authHeader;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('activeRole roles status').lean();
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }
        if (user.status === 'suspended') {
          return next(new Error('Authentication error: Account suspended'));
        }
        socket.user = { id: decoded.id, role: user.activeRole, roles: user.roles };
        next();
      } catch {
        return next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      logger.info(
        { socketId: socket.id, userId: socket.user.id, role: socket.user.role },
        'New socket connection'
      );

      // Every user joins their personal room (covers all roles for DMs/notifications)
      socket.join(`user_${socket.user.id}`);

      if (socket.user.role === 'business_owner') {
        // Business owner also joins a business_owner room; business-specific room
        // is joined dynamically when the client emits join_business
        socket.join(`business_owner_${socket.user.id}`);
        logger.info({ socketId: socket.id }, `Socket joined room business_owner_${socket.user.id}`);
      } else if (socket.user.role === 'rider') {
        socket.join(`rider_${socket.user.id}`);
        logger.info({ socketId: socket.id }, `Socket joined room rider_${socket.user.id}`);
      } else if (socket.user.role === 'admin') {
        socket.join('admin_room');
      }

      // Allow business owners to join a specific business room after providing businessId
      socket.on('join_business', (businessId) => {
        if (socket.user.role === 'business_owner' || socket.user.roles.includes('admin')) {
          socket.join(`business_${businessId}`);
          logger.info({ socketId: socket.id, businessId }, 'Socket joined business room');
        }
      });

      // Allow riders to broadcast their location
      socket.on('rider_location_update', (data) => {
        if (socket.user.role === 'rider' && data.orderId && data.lat && data.lng) {
          io.to(`order_tracking_${data.orderId}`).emit('location_update', {
            riderId: socket.user.id,
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date(),
          });
        }
      });

      // Allow customers/vendors to subscribe to a specific order tracking room
      socket.on('track_order', (orderId) => {
        socket.join(`order_tracking_${orderId}`);
      });

      socket.on('disconnect', () => {
        logger.info({ socketId: socket.id }, 'Socket disconnected');
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};

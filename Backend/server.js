require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const listingRoutes = require('./routes/listingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// --- Environment validation ---
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  // Fail fast in invalid configuration
  // eslint-disable-next-line no-console
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// --- Security & core middleware ---
app.use(helmet());

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174';
const allowedOrigins = allowedOriginsEnv.split(',').map((o) => o.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow tools like curl / Postman with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- Rate limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // stricter for auth endpoints
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general API limiter
app.use('/api', apiLimiter);

// --- Health checks ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Routes ---
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ChopNow API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      businesses: '/api/businesses',
      listings: '/api/listings',
      orders: '/api/orders',
      reviews: '/api/reviews',
      favorites: '/api/favorites',
      notifications: '/api/notifications',
    },
  });
});

// Auth routes with stricter limiter
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Database connection error:', error);
    process.exit(1);
  });
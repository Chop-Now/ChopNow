const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (req.user.status === 'suspended') {
        return res.status(403).json({ message: 'Account suspended' });
      }

      next();
    } catch (error) {
      logger.error({ err: error }, 'Token verification failed');
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * Role-based authorization middleware
 * Checks activeRole for authorization, supports multi-role users
 * Admin users can access admin routes regardless of activeRole
 * @param  {...any} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userRoles = req.user.roles || [];
    const userActiveRole = req.user.activeRole || userRoles[0];

    // IMPORTANT: If the route allows 'admin' and user HAS admin role,
    // allow access regardless of their current activeRole.
    // This ensures admins can perform admin tasks without switching roles.
    if (roles.includes('admin') && userRoles.includes('admin')) {
      return next();
    }

    // Check if user's activeRole is in the allowed roles
    if (!roles.includes(userActiveRole)) {
      // Check if user HAS one of the required roles but it's not active
      const hasRequiredRole = roles.some((role) => userRoles.includes(role));

      if (hasRequiredRole) {
        // User has the role but needs to switch to it
        const availableRole = roles.find((role) => userRoles.includes(role));
        return res.status(403).json({
          message: `Please switch to your '${availableRole}' role to access this resource`,
          code: 'WRONG_ACTIVE_ROLE',
          requiredRole: availableRole,
          currentActiveRole: userActiveRole,
          availableRoles: userRoles,
        });
      }

      return res.status(403).json({
        message: `User role '${userActiveRole}' is not authorized to access this route`,
      });
    }

    next();
  };
};

/**
 * Optional authentication - Attach user if token exists but don't require it
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-passwordHash');
    } catch (_error) {
      // Token invalid but don't block the request
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, authorize, optionalAuth };

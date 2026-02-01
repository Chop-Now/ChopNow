require('dotenv').config();
// Require instrumentation early (Sentry no-op unless configured)
const Sentry = require('./instrument');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');

// Import routes
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const listingRoutes = require('./routes/listingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestId = require('./middleware/requestId');
const logger = require('./utils/logger');

const app = express();

// --- Environment validation ---
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key] || String(process.env[key]).trim() === '');
if (missingEnv.length) {
  logger.error(`Missing required environment variables: ${missingEnv.join(', ')}. See .env.example.`);
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  if (!process.env.ALLOWED_ORIGINS || String(process.env.ALLOWED_ORIGINS).trim() === '') {
    logger.error('Production requires ALLOWED_ORIGINS to be set (e.g. https://app.chopnow.com).');
    process.exit(1);
  }
  const unsafeSecrets = ['changeme', 'your_jwt_secret', 'your_secure_random', 'example', 'test'];
  const jwt = String(process.env.JWT_SECRET);
  if (jwt.length < 32 || unsafeSecrets.some((s) => jwt.toLowerCase().includes(s))) {
    logger.error('Production requires a strong JWT_SECRET (at least 32 characters, no placeholders).');
    process.exit(1);
  }
}

const mongoUri = process.env.MONGO_URI;
if (!mongoUri.startsWith('mongodb')) {
  logger.error('MONGO_URI must be a valid MongoDB connection string (e.g. mongodb://... or mongodb+srv://...).');
  process.exit(1);
}

// --- Optional integrations validation (warn or fail fast where appropriate) ---
const cloudinaryKeys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const cloudinaryProvided = cloudinaryKeys.filter((k) => process.env[k] && String(process.env[k]).trim() !== '');
if (cloudinaryProvided.length > 0 && cloudinaryProvided.length < cloudinaryKeys.length) {
  logger.warn(`Cloudinary is partially configured. Set all of: ${cloudinaryKeys.join(', ')} to enable uploads.`);
  if (isProduction) process.exit(1);
}

const resendKey = process.env.RESEND_API_KEY && String(process.env.RESEND_API_KEY).trim() !== '';
const fromEmail = process.env.FROM_EMAIL && String(process.env.FROM_EMAIL).trim() !== '';
const frontendUrl = process.env.FRONTEND_URL && String(process.env.FRONTEND_URL).trim() !== '';
if (resendKey && (!fromEmail || !frontendUrl)) {
  logger.warn('Resend is partially configured. Set RESEND_API_KEY, FROM_EMAIL, and FRONTEND_URL to enable email flows.');
  if (isProduction) process.exit(1);
}
if (!resendKey) {
  logger.warn('RESEND_API_KEY not set: email verification / password reset / OTP emails will be disabled.');
}
if (frontendUrl && !/^https?:\/\//i.test(String(process.env.FRONTEND_URL))) {
  logger.warn('FRONTEND_URL should include scheme, e.g. https://www.chopnow.app');
}

// --- Security & core middleware ---
app.use(helmet());

// Request correlation id + structured request logging
app.use(requestId);
app.use(pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customProps: (req) => ({ reqId: req.id }),
}));

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

app.get('/ready', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (dbReady) {
    res.json({ status: 'ready', database: 'connected' });
  } else {
    res.status(503).json({ status: 'not ready', database: mongoose.STATES[mongoose.connection.readyState] || 'disconnected' });
  }
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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFound);

// Sentry error handler (must be registered before any custom error handlers)
if (process.env.SENTRY_DSN && String(process.env.SENTRY_DSN).trim() !== '') {
  Sentry.setupExpressErrorHandler(app);
}

app.use(errorHandler);

// Database connection and server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  });
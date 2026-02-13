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
const analyticsRoutes = require('./routes/analyticsRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const cartRoutes = require('./routes/cartRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestId = require('./middleware/requestId');
const logger = require('./utils/logger');
const metrics = require('./utils/metrics');

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

const sendgridKey = process.env.SENDGRID_API_KEY && String(process.env.SENDGRID_API_KEY).trim() !== '';
const fromEmail = process.env.FROM_EMAIL && String(process.env.FROM_EMAIL).trim() !== '';
const frontendUrl = process.env.FRONTEND_URL && String(process.env.FRONTEND_URL).trim() !== '';
if (sendgridKey && (!fromEmail || !frontendUrl)) {
  logger.warn('SendGrid is partially configured. Set SENDGRID_API_KEY, FROM_EMAIL, and FRONTEND_URL to enable email flows.');
  if (isProduction) process.exit(1);
}
if (!sendgridKey) {
  logger.warn('SENDGRID_API_KEY not set: email verification / password reset / OTP emails will be disabled.');
}
if (frontendUrl && !/^https?:\/\//i.test(String(process.env.FRONTEND_URL))) {
  logger.warn('FRONTEND_URL should include scheme, e.g. https://www.chopnow.app');
}

// --- Security & core middleware ---
app.use(helmet());

// Request correlation id + structured request logging
app.use(requestId);
app.use(metrics.metricsMiddleware()); // Collect request metrics
app.use(pinoHttp({
  logger,
  genReqId: (req) => req.id,
  customProps: (req) => ({ reqId: req.id }),
}));

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:5180,http://localhost:3000';
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
  max: 50, // Allow more attempts during development
  message: { message: 'Too many login attempts from this IP, please try again later.' },
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
app.use('/api/analytics', analyticsRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling
app.use(notFound);

// Sentry error handler (must be registered before any custom error handlers)
if (process.env.SENTRY_DSN && String(process.env.SENTRY_DSN).trim() !== '') {
  Sentry.setupExpressErrorHandler(app);
}

app.use(errorHandler);

// Database connection and server start
const { connectDB, setupGracefulShutdown, healthCheck } = require('./config/database');
const redis = require('./config/redis');

// Enhanced health check endpoint with database stats
app.get('/health/db', async (req, res) => {
  const dbHealth = await healthCheck();
  const statusCode = dbHealth.healthy ? 200 : 503;
  res.status(statusCode).json(dbHealth);
});

// Redis cache health check endpoint
app.get('/health/cache', async (req, res) => {
  const cacheStats = await redis.getStats();
  const statusCode = cacheStats.available ? 200 : 503;
  res.status(statusCode).json(cacheStats);
});

// Combined health check for all services
app.get('/health/all', async (req, res) => {
  const [dbHealth, cacheStats] = await Promise.all([
    healthCheck(),
    redis.getStats(),
  ]);

  const allHealthy = dbHealth.healthy;
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'healthy' : 'degraded',
    services: {
      database: dbHealth,
      cache: cacheStats,
    },
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint for monitoring
app.get('/metrics', async (req, res) => {
  const appMetrics = metrics.getMetrics();
  const mongoMetrics = await metrics.getMongoMetrics();

  res.json({
    application: appMetrics,
    mongodb: mongoMetrics,
  });
});

// Prometheus-compatible metrics endpoint (optional)
app.get('/metrics/prometheus', async (req, res) => {
  const appMetrics = metrics.getMetrics();

  // Generate Prometheus-format metrics
  const lines = [
    '# HELP chopnow_http_requests_total Total HTTP requests',
    '# TYPE chopnow_http_requests_total counter',
    `chopnow_http_requests_total ${appMetrics.http.totalRequests}`,
    '',
    '# HELP chopnow_http_errors_total Total HTTP errors',
    '# TYPE chopnow_http_errors_total counter',
    `chopnow_http_errors_total ${appMetrics.http.errors}`,
    '',
    '# HELP chopnow_http_latency_p50 HTTP latency 50th percentile',
    '# TYPE chopnow_http_latency_p50 gauge',
    `chopnow_http_latency_p50 ${appMetrics.http.latency.p50}`,
    '',
    '# HELP chopnow_http_latency_p95 HTTP latency 95th percentile',
    '# TYPE chopnow_http_latency_p95 gauge',
    `chopnow_http_latency_p95 ${appMetrics.http.latency.p95}`,
    '',
    '# HELP chopnow_http_latency_p99 HTTP latency 99th percentile',
    '# TYPE chopnow_http_latency_p99 gauge',
    `chopnow_http_latency_p99 ${appMetrics.http.latency.p99}`,
    '',
    '# HELP chopnow_cache_hit_rate Cache hit rate percentage',
    '# TYPE chopnow_cache_hit_rate gauge',
    `chopnow_cache_hit_rate ${appMetrics.cache.hitRate}`,
    '',
    '# HELP chopnow_memory_heap_used_bytes Heap memory used',
    '# TYPE chopnow_memory_heap_used_bytes gauge',
    `chopnow_memory_heap_used_bytes ${appMetrics.memory.raw.heapUsed}`,
    '',
    '# HELP chopnow_uptime_seconds Application uptime',
    '# TYPE chopnow_uptime_seconds counter',
    `chopnow_uptime_seconds ${appMetrics.uptime.seconds}`,
  ];

  res.set('Content-Type', 'text/plain');
  res.send(lines.join('\n'));
});

// Setup graceful shutdown handlers
setupGracefulShutdown();

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Redis (optional - won't fail if unavailable)
    await redis.initRedis();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      logger.info({ port, env: process.env.NODE_ENV || 'development' }, `Server running on port ${port}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

// Handle graceful shutdown for Redis
process.on('SIGTERM', async () => {
  await redis.close();
});

process.on('SIGINT', async () => {
  await redis.close();
});

startServer();
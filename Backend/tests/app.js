/**
 * Test application helper
 *
 * Builds the same Express app that server.js builds but does NOT call
 * startServer(), connectDB(), or app.listen(). This lets supertest drive
 * requests directly against the app without opening a port.
 *
 * Environment variables (JWT_SECRET, MONGO_URI, NODE_ENV) are expected to
 * already be set by tests/setup.js before this module is required.
 */

require('dotenv').config();

// Ensure required env vars are present (setup.js sets defaults)
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/chopnow-test';
process.env.NODE_ENV = 'test';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const userRoutes = require('../routes/userRoutes');

// Import middleware
const { errorHandler, notFound } = require('../middleware/errorHandler');
const requestId = require('../middleware/requestId');

const app = express();

// ── Minimal middleware stack (mirrors server.js but skips rate limiters,
//    swagger, pino-http, and integrations that are unnecessary for tests) ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(requestId);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Security well-known ──
app.get('/.well-known/security.txt', (req, res) => {
  res
    .type('text/plain')
    .send(
      `Contact: mailto:security@chopnow.app\n` +
        `Preferred-Languages: en\n` +
        `Canonical: https://api.chopnow.app/.well-known/security.txt\n` +
        `Policy: https://chopnow.app/security-policy\n`
    );
});

// ── Health checks ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (dbReady) {
    res.json({ status: 'ready', database: 'connected' });
  } else {
    res.status(503).json({
      status: 'not ready',
      database: mongoose.STATES[mongoose.connection.readyState] || 'disconnected',
    });
  }
});

// ── Root ──
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ChopNow API',
    version: '1.0.0',
  });
});

// ── API routes ──
app.use('/api/v1/users', userRoutes);
app.use('/api/users', userRoutes); // backward compatibility

// ── Error handling ──
app.use(notFound);
app.use(errorHandler);

module.exports = app;

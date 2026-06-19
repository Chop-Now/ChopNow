/**
 * Jest Test Setup
 *
 * - Connects to a test MongoDB instance (MONGO_URI env var or localhost fallback)
 * - Clears all collections before each test
 * - Closes the connection after all tests
 * - Mocks the logger to suppress output during tests
 * - Mocks emailService to prevent real emails from being sent
 */
const mongoose = require('mongoose');

// ── Set required env vars for the app to load without crashing ──
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/chopnow-test';
process.env.NODE_ENV = 'test';

// ── Mock the logger so tests produce no pino output ──
jest.mock('../utils/logger', () => {
  const noop = () => {};
  const child = () => mockLogger;
  const mockLogger = {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    fatal: noop,
    trace: noop,
    child,
    // pino-http compatibility
    level: 'silent',
  };
  return mockLogger;
});

// ── Mock emailService so no real emails are ever sent ──
jest.mock('../utils/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendOTPEmail: jest.fn().mockResolvedValue(true),
  sendPasswordChangeOTP: jest.fn().mockResolvedValue(true),
  sendPasswordChangedConfirmation: jest.fn().mockResolvedValue(true),
  sendSensitiveChangeOTP: jest.fn().mockResolvedValue(true),
}));

// ── Connect to test database before the suite runs ──
beforeAll(async () => {
  const uri = process.env.MONGO_URI;
  
  // Safety guard: Check if uri points to production Atlas instance
  if (uri && (uri.includes('mongodb.net') || uri.includes('replicaSet') || !uri.includes('test'))) {
    console.error('❌ FATAL ERROR: Attempting to run tests against a non-test or production database: ' + uri);
    process.exit(1);
  }
  
  // Disconnect first if already connected (e.g. app preloaded connection)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

// ── Clear every collection before each test for isolation ──
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

// ── Tear down after the entire suite ──
afterAll(async () => {
  await mongoose.connection.close();
});

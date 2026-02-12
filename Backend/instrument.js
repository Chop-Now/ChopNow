const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

// Initialize Sentry early (before other modules) when configured.
// This file is safe to require in all envs; it becomes a no-op if SENTRY_DSN is not set.
if (process.env.SENTRY_DSN && String(process.env.SENTRY_DSN).trim() !== '') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Tracing - capture transactions for performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling - set sampling rate
    profileSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profileLifecycle: 'trace',
    // Keep PII off by default for privacy
    sendDefaultPii: false,
  });
}

module.exports = Sentry;

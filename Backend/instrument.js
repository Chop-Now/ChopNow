const Sentry = require('@sentry/node');

// Initialize Sentry early (before other modules) when configured.
// This file is safe to require in all envs; it becomes a no-op if SENTRY_DSN is not set.
if (process.env.SENTRY_DSN && String(process.env.SENTRY_DSN).trim() !== '') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
    // Keep PII off by default; enable explicitly if needed.
    sendDefaultPii: false,
  });
}

module.exports = Sentry;


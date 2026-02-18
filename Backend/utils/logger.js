const pino = require('pino');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const logger = pino({
  level,
  base: {
    service: 'chopnow-backend',
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordHash',
      'req.body.token',
      'req.body.otp',
      'req.body.otpCode',
    ],
    censor: '[REDACTED]',
  },
});

module.exports = logger;

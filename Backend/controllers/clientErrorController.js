const Sentry = require('@sentry/node');
const logger = require('../utils/logger');

// Keeps text only: control characters (other than line breaks in a stack) become spaces.
const clip = (value, max, { oneLine = false } = {}) => {
  if (typeof value !== 'string') return undefined;
  const text = Array.from(value.slice(0, max))
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code < 32 && ch !== '\n' ? ' ' : ch;
    })
    .join('');
  return oneLine ? text.replace(/\s+/g, ' ') : text;
};

/**
 * @desc    Receive a crash/error report from the web app so problems real users hit are not invisible
 * @route   POST /api/client-errors
 * @access  Public (rate limited). Fields are clipped and never trusted or echoed back.
 */
const reportClientError = (req, res) => {
  const message = clip(req.body?.message, 500, { oneLine: true });
  if (!message) return res.status(400).json({ message: 'message is required' });

  const report = {
    message,
    stack: clip(req.body?.stack, 3000),
    source: clip(req.body?.source, 40),
    url: clip(req.body?.url, 300),
    userAgent: clip(req.get('user-agent'), 200),
    release: clip(req.body?.release, 40),
  };
  logger.warn({ clientError: report }, 'Web app error reported');
  Sentry.captureMessage(`Web app error: ${message}`, { level: 'error', extra: report });
  // 204: the browser does not need anything back.
  return res.status(204).end();
};

module.exports = { reportClientError };

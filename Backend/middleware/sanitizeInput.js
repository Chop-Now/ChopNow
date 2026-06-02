/**
 * sanitizeInput.js
 *
 * Express middleware that strips all HTML tags from string fields in req.body.
 * Applied globally after express.json() to protect text inputs on all routes.
 *
 * Targeted fields: title, description, comment, name (and any other string values).
 * Uses sanitize-html with an allowlist of zero tags/attributes — pure plaintext output.
 */

const sanitizeHtml = require('sanitize-html');

const SANITIZE_OPTIONS = {
  allowedTags: [],
  allowedAttributes: {},
};

/**
 * Recursively sanitize all string values in an object.
 * Preserves non-string types (numbers, booleans, arrays, nested objects).
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value, SANITIZE_OPTIONS);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Middleware: sanitizes req.body string fields in-place.
 */
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

module.exports = sanitizeInput;

const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Middleware to ensure request idempotency.
 * Expects an 'Idempotency-Key' header from the client.
 * Results are cached for 24 hours.
 */
const idempotency = (ttl = 86400) => {
  return async (req, res, next) => {
    // Only apply to POST/PUT/PATCH/DELETE
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const key = req.header('Idempotency-Key');
    if (!key) {
      // In production, we might want to enforce this, but for now we'll just skip
      return next();
    }

    const userId = req.user ? req.user.id : 'anonymous';
    const idempotencyKey = `idempotency:${userId}:${key}`;

    try {
      const cachedResponse = await redis.get(idempotencyKey);
      if (cachedResponse) {
        logger.info({ idempotencyKey }, 'Returning cached idempotent response');
        const { statusCode, body, headers } = JSON.parse(cachedResponse);
        
        // Replay headers if necessary
        if (headers) {
          Object.keys(headers).forEach(h => res.set(h, headers[h]));
        }
        
        return res.status(statusCode).send(body);
      }

      // Intercept res.send to cache the result
      const originalSend = res.send;
      res.send = function (body) {
        // Only cache successful or client error responses (don't cache 5xx)
        if (res.statusCode < 500) {
          const responseToCache = {
            statusCode: res.statusCode,
            body: body,
            headers: {
              'Content-Type': res.get('Content-Type'),
            },
          };
          
          redis.set(idempotencyKey, JSON.stringify(responseToCache), 'EX', ttl)
            .catch(err => logger.error({ err }, 'Failed to cache idempotent response'));
        }
        
        return originalSend.call(this, body);
      };

      next();
    } catch (err) {
      logger.error({ err }, 'Idempotency check failed');
      next(); // Fail open for safety, or next(err) to fail closed
    }
  };
};

module.exports = idempotency;

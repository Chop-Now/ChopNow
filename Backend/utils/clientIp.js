const net = require('net');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * The visitor's real IP, for rate limiting.
 *
 * Production traffic never reaches the app straight from the visitor:
 *  - the website calls /api on www.chopnow.app, which Vercel rewrites to Render, and
 *  - Render serves onrender.com through Cloudflare.
 * So `req.ip` (with `trust proxy` 1) is a proxy node's address. Every visitor shared a
 * handful of those, which made the per-IP limits effectively site-wide (measured on
 * 2026-10-10: one client's requests landed on several unrelated counters).
 *
 *  - Through Vercel (it adds x-vercel-id): Vercel reports the visitor in
 *    x-vercel-forwarded-for / x-real-ip / the first X-Forwarded-For entry.
 *  - Directly through Cloudflare: CF-Connecting-IP is the visitor, and Cloudflare
 *    overwrites any value the client sends.
 *
 * The Vercel headers can be forged by someone calling Render directly, which only lets
 * them dodge the general per-IP limits; anything guessable (passwords, codes) is also
 * limited per account in server.js, independent of IP.
 */
const firstValidIp = (value) => {
  for (const part of String(value || '').split(',')) {
    const ip = part.trim();
    if (net.isIP(ip)) return ip;
  }
  return null;
};

const clientIp = (req) => {
  const header = (name) => req.get?.(name);
  if (header('x-vercel-id')) {
    const viaVercel =
      firstValidIp(header('x-vercel-forwarded-for')) ||
      firstValidIp(header('x-real-ip')) ||
      firstValidIp(header('x-forwarded-for'));
    if (viaVercel) return viaVercel;
  }
  return firstValidIp(header('cf-connecting-ip')) || req.ip;
};

// Rate-limit key for the visitor (IPv6 addresses are grouped by /56, as express-rate-limit does)
const clientIpKey = (req) => ipKeyGenerator(clientIp(req));

module.exports = { clientIp, clientIpKey };

/**
 * Rwandan mobile numbers are written "0788 123 456", "+250 788 123 456" or
 * "250788123456". Returns the canonical digits "250788123456", or null when the
 * input is not a Rwandan mobile number (7 followed by 8 more digits).
 */
function normalizeRwandaMobile(input) {
  if (typeof input !== 'string') return null;
  let digits = input.replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(digits)) return null;
  digits = digits.replace(/^\+/, '');
  if (digits.startsWith('250')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return /^7\d{8}$/.test(digits) ? `250${digits}` : null;
}

module.exports = { normalizeRwandaMobile };

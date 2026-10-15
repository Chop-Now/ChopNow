/**
 * What a shop must have on file before it can be approved and sell: one verification document,
 * its real map location (customers' pickup directions and the delivery courier's pickup point),
 * and a mobile number customers and riders can call. Used when a vendor submits for review and
 * again when an admin approves, so neither can skip it.
 */
const { normalizeRwandaMobile } = require('./phone');

// Rough box around Rwanda. It catches a stray GPS fix or a typo'd pin on another continent; it is
// not meant to decide which town a shop is in.
const RWANDA = { minLat: -2.9, maxLat: -1.0, minLng: 28.8, maxLng: 31.0 };

const coordinatesOf = (location) => {
  const [lng, lat] = Array.isArray(location?.coordinates) ? location.coordinates.map(Number) : [];
  return { lat, lng };
};

/** Why a location can't be used, or null when it is a real spot in Rwanda. */
const locationProblem = (location) => {
  const { lat, lng } = coordinatesOf(location);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
    return 'Please set your shop location on the map (or tap "Use my current location").';
  }
  if (lat < RWANDA.minLat || lat > RWANDA.maxLat || lng < RWANDA.minLng || lng > RWANDA.maxLng) {
    return 'That location is outside Rwanda. Please set where your shop really is.';
  }
  return null;
};

const phoneProblem = (phone) =>
  normalizeRwandaMobile(phone)
    ? null
    : 'Please enter a Rwandan mobile number (for example 0788 123 456) so customers and riders can call you.';

/**
 * Everything still missing, as short sentences a vendor or an admin can read.
 * @param {{phone?: string, location?: object}} shop
 * @param {number} documentCount documents on file (including any being uploaded now)
 */
const missingForApproval = (shop, documentCount) => {
  const missing = [];
  if (!documentCount) missing.push('Upload one verification document.');
  const place = locationProblem(shop.location);
  if (place) missing.push(place);
  const phone = phoneProblem(shop.phone);
  if (phone) missing.push(phone);
  return missing;
};

module.exports = { missingForApproval, locationProblem, phoneProblem, RWANDA };

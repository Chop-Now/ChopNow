/**
 * Moving Man (Kigali bike delivery) - the courier that carries ChopNow delivery orders until
 * the rider app is ready. Guide: "Moving Man Booking API" v1.0, 10 Oct 2026.
 *
 *  - quoteDelivery(): free, books nothing. Gives the real price for one pickup -> drop-off.
 *  - bookDelivery():  books a rider on ChopNow's account. Safe to repeat: the order number is
 *    the external_reference, and Moving Man never books the same reference twice.
 *
 * The key and the registered company name come from the environment and never reach a browser:
 *   MOVING_MAN_API_KEY   (starts with "mm_")
 *   MOVING_MAN_COMPANY   (the business name registered with Moving Man)
 * With either missing, isConfigured() is false and ChopNow keeps its flat delivery fee.
 *
 * Moving Man has no status, tracking or cancel endpoint: after booking, delivery is confirmed
 * by the vendor in ChopNow, and changes go through their dispatch on WhatsApp.
 */
const logger = require('../utils/logger');

const BASE_URL = () => process.env.MOVING_MAN_BASE_URL || 'https://movingman.online';
// Their guide says most calls take 5-10 s and asks for a 120 s timeout when booking. A quote
// is shown to someone waiting at checkout, so it gives up sooner.
const QUOTE_TIMEOUT_MS = 40_000;
const BOOK_TIMEOUT_MS = 120_000;
// Same pickup and drop-off give the same price, so a repeat within this time is free and instant.
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX = 500;
// Moving Man allows 30 calls a minute per key. Stay under it so a burst of quotes can never
// lock out the bookings that matter.
const LIVE_CALLS_PER_MINUTE = 24;

const isConfigured = () =>
  !!(process.env.MOVING_MAN_API_KEY && process.env.MOVING_MAN_COMPANY && fetchAvailable());
const fetchAvailable = () => typeof fetch === 'function';

/** An error the customer or vendor can be told about in plain words. */
class CourierError extends Error {
  constructor(code, userMessage, { status = 502, cause } = {}) {
    super(userMessage);
    this.code = code;
    this.userMessage = userMessage;
    this.status = status;
    if (cause) this.cause = cause;
  }
}

const UNAVAILABLE = 'Delivery is temporarily unavailable. Please try again in a few minutes.';

// ── pins and text ─────────────────────────────────────────────────────────

/** "lat,lng" from a GeoJSON [lng, lat] pair, or undefined when it is missing or the [0,0] default. */
const pinFromCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return undefined;
  const [lng, lat] = coordinates.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
  if (lat === 0 && lng === 0) return undefined;
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
};

const addressText = (address, fallback = 'Kigali') => {
  let text = '';
  if (typeof address === 'string') text = address;
  else if (address && typeof address === 'object') {
    text = address.text || [address.street, address.city].filter(Boolean).join(', ');
  }
  text = text.replace(/\s+/g, ' ').trim().slice(0, 80);
  return text.length >= 2 ? text : fallback;
};

const clip = (value, max) =>
  String(value || '')
    .trim()
    .slice(0, max);

// ── live-call budget, cache ───────────────────────────────────────────────

const liveCalls = [];
const takeLiveCall = () => {
  const now = Date.now();
  while (liveCalls.length && now - liveCalls[0] > 60_000) liveCalls.shift();
  if (liveCalls.length >= LIVE_CALLS_PER_MINUTE) return false;
  liveCalls.push(now);
  return true;
};

const cache = new Map();
const inFlight = new Map();
const cacheGet = (key) => {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return hit.value;
};
const cacheSet = (key, value) => {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, { value, at: Date.now() });
};
/** For tests. */
const resetForTests = () => {
  cache.clear();
  inFlight.clear();
  liveCalls.length = 0;
};

// ── HTTP ──────────────────────────────────────────────────────────────────

const failureFor = (status, body) => {
  const code = body?.error?.code;
  const fields = body?.error?.fields || [];
  switch (code) {
    case 'OUTSIDE_SERVICE_AREA':
      return new CourierError(
        code,
        'We deliver inside Kigali only. Please choose a Kigali address, or pick your order up instead.',
        { status: 422 }
      );
    case 'ADDRESS_NOT_FOUND':
      return new CourierError(
        code,
        'We could not place that address. Please pick the exact spot on the map.',
        { status: 422 }
      );
    case 'VALIDATION_FAILED': {
      const detail = fields[0]?.message ? ` (${fields[0].message})` : '';
      return new CourierError(
        code,
        `The courier could not accept these delivery details${detail}.`,
        {
          status: 422,
        }
      );
    }
    case 'NOT_ACCEPTING_ORDERS':
      return new CourierError(code, UNAVAILABLE, { status: 503 });
    case 'RATE_LIMITED':
      return new CourierError(code, UNAVAILABLE, { status: 503 });
    case 'UNAUTHORIZED':
    case 'CLIENT_DISABLED':
    case 'COMPANY_MISMATCH':
      // Our setup is wrong, not the customer's input: shout in the logs, stay vague outside.
      logger.error({ code, status }, 'Moving Man refused our credentials');
      return new CourierError(code, UNAVAILABLE, { status: 503 });
    default:
      return new CourierError(code || 'COURIER_ERROR', UNAVAILABLE, { status: 503 });
  }
};

async function call(path, body, timeoutMs) {
  if (!isConfigured()) throw new CourierError('NOT_CONFIGURED', UNAVAILABLE, { status: 503 });
  let res;
  try {
    res = await fetch(`${BASE_URL()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.MOVING_MAN_API_KEY },
      body: JSON.stringify({ booking_company: process.env.MOVING_MAN_COMPANY, ...body }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    logger.warn({ err: err.message, path }, 'Moving Man could not be reached');
    throw new CourierError('UNREACHABLE', UNAVAILABLE, { status: 503, cause: err });
  }
  let json = null;
  try {
    json = await res.json();
  } catch {
    // fall through: handled as a failure below
  }
  if (!res.ok || !json?.ok) {
    if (res.status >= 500) logger.warn({ status: res.status, path }, 'Moving Man server error');
    throw failureFor(res.status, json);
  }
  return json;
}

// ── public API ────────────────────────────────────────────────────────────

/**
 * Price of one delivery from a shop to a customer.
 * @param {{name: string, address: any, coordinates: number[]}} pickup  shop (GeoJSON [lng,lat])
 * @param {{address: any, coordinates: number[]}} dropoff                customer's chosen spot
 * @returns {Promise<{amountRwf: number, distanceKm: number, estMinutes: number}>}
 */
async function quoteDelivery(pickup, dropoff) {
  const pickupPin = pinFromCoordinates(pickup.coordinates);
  const dropoffPin = pinFromCoordinates(dropoff.coordinates);
  if (!pickupPin) {
    throw new CourierError(
      'SHOP_LOCATION_MISSING',
      `${pickup.name || 'This shop'} has not set its pickup location on the map yet, so it cannot deliver right now.`,
      { status: 422 }
    );
  }
  if (!dropoffPin) {
    throw new CourierError(
      'DROPOFF_LOCATION_MISSING',
      'Please set your delivery location on the map.',
      {
        status: 422,
      }
    );
  }

  const key = `${pickupPin}|${dropoffPin}`;
  const cached = cacheGet(key);
  if (cached) return cached;
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    const body = {
      restaurant_name: clip(pickup.name || 'ChopNow vendor', 60).padEnd(2, ' '),
      restaurant_address: addressText(pickup.address),
      restaurant_pin: pickupPin,
      receiver_address: addressText(dropoff.address),
      receiver_pin: dropoffPin,
    };
    // Their quote service answers in 4-30 seconds and now and then times out (504). A quote is free
    // and books nothing, so one automatic second try is safe and saves most customers a retry.
    let json;
    for (let attempt = 1; ; attempt++) {
      if (!takeLiveCall()) {
        throw new CourierError(
          'BUSY',
          'Delivery prices are busy right now. Please try again in a moment.',
          { status: 503 }
        );
      }
      try {
        json = await call('/api/quote', body, QUOTE_TIMEOUT_MS);
        break;
      } catch (err) {
        const transient = ['UNREACHABLE', 'UPSTREAM_UNAVAILABLE'].includes(err.code);
        if (!(err instanceof CourierError) || !transient || attempt >= 2) throw err;
        logger.warn({ code: err.code }, 'Moving Man quote failed, trying once more');
      }
    }
    const value = {
      amountRwf: Math.round(json.price.amount_rwf),
      distanceKm: json.price.distance_km,
      estMinutes: json.price.est_minutes,
    };
    cacheSet(key, value);
    return value;
  })();
  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

/**
 * Books a rider for one delivery order. Idempotent on the order number.
 * @returns {Promise<{bookingReference: string, bookedRwf: number, distanceKm: number, duplicate: boolean}>}
 */
async function bookDelivery({
  orderNumber,
  shopName,
  shopAddress,
  shopCoordinates,
  shopPhone,
  recipientName,
  recipientPhone,
  dropoffAddress,
  dropoffCoordinates,
  notes,
}) {
  const body = {
    external_reference: orderNumber,
    restaurant_name: clip(shopName || 'ChopNow vendor', 60).padEnd(2, ' '),
    restaurant_address: addressText(shopAddress),
    item_type: 'Food',
    receiver_name: clip(recipientName || 'Customer', 60).padEnd(2, ' '),
    receiver_address: addressText(dropoffAddress),
    receiver_phone: recipientPhone,
    pickup_time: 'now',
    payer: 'sender',
    pay_method: 'account',
    size: 'small',
    notes: clip(notes, 200),
  };
  const shopPin = pinFromCoordinates(shopCoordinates);
  if (shopPin) body.restaurant_pin = shopPin;
  const dropPin = pinFromCoordinates(dropoffCoordinates);
  if (dropPin) body.receiver_pin = dropPin;
  // Their dispatch number is used when we send none, so only send a real mobile number.
  if (/^(\+?250|0)?7[2389]\d{7}$/.test(String(shopPhone || '').replace(/[\s-]/g, ''))) {
    body.restaurant_phone = String(shopPhone).replace(/[\s-]/g, '');
  }

  const json = await call('/api/request', body, BOOK_TIMEOUT_MS);
  return {
    bookingReference: json.booking_reference,
    bookedRwf: Math.round(json.price?.amount_rwf || 0),
    distanceKm: json.price?.distance_km,
    duplicate: !!json.duplicate,
  };
}

module.exports = {
  isConfigured,
  quoteDelivery,
  bookDelivery,
  CourierError,
  pinFromCoordinates,
  resetForTests,
};

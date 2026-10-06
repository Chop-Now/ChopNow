const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
// Nominatim's usage policy requires a way to identify/contact the caller.
// The 'User-Agent' header below is NOT actually sent - browsers treat it as a
// forbidden header name and silently strip anything script sets it to on
// fetch(), always substituting the browser's own real UA string instead.
// Nominatim still sees who's calling via the automatic Referer header
// (chopnow.app, sent by the browser itself, not this code), so identification
// isn't fully lost - but this header line has never done what it looks like
// it does. Left in place (harmless) with the address corrected for whoever
// reads it next, rather than removed - a real fix would mean proxying this
// through the backend so a custom header can actually be set.
const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

// A map-lookup service that is slow or unreachable must never leave someone stuck
// on "looking up your address": give up after a few seconds so callers can fall
// back (coordinates still travel with the order).
async function fetchJson(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function searchAddress(query) {
  if (
    LOCATIONIQ_KEY &&
    LOCATIONIQ_KEY !== 'YOUR_LOCATIONIQ_ACCESS_TOKEN' &&
    LOCATIONIQ_KEY !== 'your_locationiq_access_token'
  ) {
    return fetchJson(
      `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json`
    );
  }

  return fetchJson(`${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'ChopNow/1.0 (chopnow.app@gmail.com)',
    },
  });
}

export async function reverseGeocode(lat, lon) {
  if (
    LOCATIONIQ_KEY &&
    LOCATIONIQ_KEY !== 'YOUR_LOCATIONIQ_ACCESS_TOKEN' &&
    LOCATIONIQ_KEY !== 'your_locationiq_access_token'
  ) {
    return fetchJson(
      `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`
    );
  }

  return fetchJson(`${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`, {
    headers: {
      'User-Agent': 'ChopNow/1.0 (chopnow.app@gmail.com)',
    },
  });
}

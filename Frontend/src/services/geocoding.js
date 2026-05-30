const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

export async function searchAddress(query) {
  if (
    LOCATIONIQ_KEY &&
    LOCATIONIQ_KEY !== 'YOUR_LOCATIONIQ_ACCESS_TOKEN' &&
    LOCATIONIQ_KEY !== 'your_locationiq_access_token'
  ) {
    const res = await fetch(
      `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json`
    );
    return res.json();
  }

  const res = await fetch(`${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': 'ChopNow/1.0 (info@chopnow.com)',
    },
  });
  return res.json();
}

export async function reverseGeocode(lat, lon) {
  if (
    LOCATIONIQ_KEY &&
    LOCATIONIQ_KEY !== 'YOUR_LOCATIONIQ_ACCESS_TOKEN' &&
    LOCATIONIQ_KEY !== 'your_locationiq_access_token'
  ) {
    const res = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lon}&format=json`
    );
    return res.json();
  }

  const res = await fetch(`${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`, {
    headers: {
      'User-Agent': 'ChopNow/1.0 (info@chopnow.com)',
    },
  });
  return res.json();
}

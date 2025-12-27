const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

export async function searchAddress(query) {
  const res = await fetch(
    `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}`,
    {
      headers: {
        "User-Agent": "YourAppName/1.0 (contact@yourdomain.com)",
      },
    }
  );
  return res.json();
}

export async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": "YourAppName/1.0 (contact@yourdomain.com)",
      },
    }
  );
  return res.json();
}

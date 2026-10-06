/*
 * ChopNow service worker. Deliberately small and conservative:
 *  - pages: network first, so a deploy is picked up immediately; only when the
 *    network is unreachable do we show the offline page
 *  - everything else (including /assets/*) goes straight to the network. The files in
 *    /assets/ are content-hashed and served with a one-year immutable cache header, so the
 *    browser's own HTTP cache already makes repeat visits fast. Caching them here as well
 *    piled up every old build (hundreds of files) and left one tab unable to load the login
 *    page after a deploy, until its service worker was cleared by hand.
 *  - /api and anything cross-origin: never touched (orders, payments and auth
 *    must always hit the server)
 * Bump CACHE whenever the caching rules change: activating the new worker deletes every
 * other cache, which is how older versions of this file clean up after themselves.
 */
const CACHE = 'chopnow-v2';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icon-192.png']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});

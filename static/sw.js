/* ============================================================
   EXPENSE TRACKER — SERVICE WORKER
   PWA: Fast loading & offline support
   ============================================================ */

const CACHE_NAME = 'expense-tracker-v1';

const STATIC_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/script.js',
  '/static/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
];

/* Install — cache static assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch — network first for API, cache first for static */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

const CACHE_NAME = 'pwa-cache-v1';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});
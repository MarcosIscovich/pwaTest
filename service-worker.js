const CACHE_NAME = 'pwa-cache-v2';
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/img/icon-192x192.png',
  '/img/icon-512x512.png',
  '/fallback.html'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker instalándose');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        console.log('Todos los recursos han sido cacheados');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando cache antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora solicitudes de chrome-extension
  if (event.request.url.includes('chrome-extension')) {
    return;
  }

  // Estrategia Cache First con fallback a Network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Devuelve la respuesta en caché si existe
        if (cachedResponse) {
          console.log('Sirviendo desde cache:', event.request.url);
          return cachedResponse;
        }

        // Si no está en caché, haz la petición a la red
        return fetch(event.request)
          .then(networkResponse => {
            // Si la respuesta es válida, clónala y guárdala en caché
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('Guardando en cache:', event.request.url);
              });

            return networkResponse;
          })
          .catch(() => {
            // Fallback para páginas
            if (event.request.mode === 'navigate') {
              return caches.match('/fallback.html');
            }
            
            // Fallback para otros recursos
            return new Response('Recurso no disponible en modo offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
const CACHE_NAME = 'monitor-dolar-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // cache the response
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => {
            // offline fallback
            return cache.match(event.request);
          });
      })
    );
  }
});

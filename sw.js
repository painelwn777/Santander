const CACHE_NAME = 'santander-cache-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './santander.png',
  './logo.png',
  './comprovante.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Navegação: tenta a versão atual do servidor primeiro.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone);
            });
          }

          return response;
        })
        .catch(() => caches.match('./index.html'))
    );

    return;
  }

  // Outros arquivos: cache primeiro.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
        }

        return response;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

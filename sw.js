const CACHE_NAME = 'santander-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './santander.png',
  './logo.png',
  './comprovante.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Instalar o Service Worker e cachear os arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto com sucesso');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Erro ao cachear arquivos:', err))
  );
});

// Interceptar requisições e servir do cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Limpar caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
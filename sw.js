const CACHE_NAME = 'santander-cache-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './santander.png',
  './logo.png',
  './comprovante.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Instalação - cacheia os assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Falha ao cachear alguns assets:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação - limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Removendo cache antigo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercepta requisições - estratégia: cache first, depois network
self.addEventListener('fetch', (event) => {
  // Ignora requisições de outros domínios que não são essenciais
  if (event.request.url.startsWith('chrome-extension')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Retorna do cache e atualiza em background
          event.waitUntil(
            fetch(event.request)
              .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                  const responseClone = networkResponse.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                  });
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        // Se não está em cache, busca da rede
        return fetch(event.request).catch(() => {
          // Fallback para página offline
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});

// Sincronização em background (para transações offline futuras)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] Sincronizando transações pendentes...');
    event.waitUntil(syncPendingTransactions());
  }
});

function syncPendingTransactions() {
  // Placeholder para sincronização futura
  return Promise.resolve();
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
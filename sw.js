const CACHE_NAME = 'bumkal-pwa-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/firebase-config.js',
  './pages/setting.html',
  './pages/setting-user.html',
  './pages/hak-akses.html',
  './pages/tutup-buku.html',
  './pages/login.html',
  './pages/akun.html',
  './pages/saldo-awal.html',
  './pages/input-jurnal.html'
];

// Install Event - Caching Aman tanpa gagal total
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`Gagal cache file: ${url}`, err)))
      );
    })
  );
  self.skipWaiting();
});

// Activate Event - Hapus Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
                console.log('[Service Worker] Hapus cache lama:', cache);
                return caches.delete(cache);
            }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
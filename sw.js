const CACHE_NAME = 'akt-bumkal-v3';

// Daftar aset utama yang disimpan ke cache awal
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './pages/dashboard.html',
  './pages/kalender.html',
  './pages/login.html',
  './pages/pohon-tambah.html',
  './pages/setting.html',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// 1. Install: Simpan aset ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate: Hapus cache versi lama (v1) secara otomatis
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: Ambil dari jaringan/cache dengan fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Mode offline
      });

      return cachedResponse || fetchPromise;
    })
  );
});
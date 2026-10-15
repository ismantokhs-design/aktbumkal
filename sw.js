const CACHE_NAME = 'pisangku-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './pages/login.html',
  './pages/dashboard.html'
];

// 1. Install & Cache Berkas
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 2. Aktivasi & Hapus Cache Lama Jika Ada Perubahan
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Ambil Berkas dari Cache / Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
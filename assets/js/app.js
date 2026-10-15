if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service Worker berhasil didaftarkan:', reg.scope))
      .catch((err) => console.error('Gagal mendaftarkan Service Worker:', err));
  });
}
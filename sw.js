const CACHE_NAME = 'eka-cache-v1';
const assetsToCache = [
  'index.html',
  'style.css',
  'app.js',
  'manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // في حال انقطاع الشبكة تماماً يعمل التطبيق من التخزين التلقائي
      return caches.match('index.html');
    })
  );
});

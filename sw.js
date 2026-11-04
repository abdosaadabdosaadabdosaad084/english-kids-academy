const CACHE = 'english-pro-v17';
const FILES = ['index.html','grammar.html','manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(()=> caches.match('index.html'))));
});

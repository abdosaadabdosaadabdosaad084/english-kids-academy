const CACHE_NAME = 'english-pro-v2';
const urlsToCache = ['/', '/index.html', '/style.css', '/app.js', '/manifest.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); });

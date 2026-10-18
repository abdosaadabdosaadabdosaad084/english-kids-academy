const CACHE_NAME = "english-kids-academy-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

// 1. Install & Cache App Shell
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate & Delete Old Caches
self.addEventListener("activate", event => {
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

// 3. Fetch Strategy: Network First with Cache Fallback (Supports External Assets)
self.addEventListener("fetch", event => {
  const request = event.request;

  // تجاهل أي طلبات غير GET
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // التأكد من صحة الاستجابة (بما في ذلك الأصول الخارجية opaque responses)
        if (response && (response.ok || response.type === 'opaque')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(async () => {
        // البحث عن المورد في الكاش عند عدم وجود إنترنت
        const cached = await caches.match(request);
        if (cached) return cached;

        // إذا كان طلب ملاحة (الصفحة الرئيسية)
        if (request.mode === "navigate") {
          const home = await caches.match("./index.html");
          if (home) return home;
        }

        // صفحة تنبيه في حالة عدم العثور على أي كاش
        return new Response("أنت غير متصل بالإنترنت، حاول فتح صفحة سبق تحميلها.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});

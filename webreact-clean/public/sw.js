const CACHE_NAME = "app-shell-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";
const APP_SHELL = [
  "/",
  "/index.html"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.error("Error al cachear App Shell:", err))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      if (cacheRes) return cacheRes;

      return fetch(event.request)
        .then((networkRes) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            if (event.request.method === "GET") {
              cache.put(event.request, networkRes.clone());
            }
            return networkRes;
          });
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

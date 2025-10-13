const CACHE_NAME = "app-shell-v2";
const DYNAMIC_CACHE = "dynamic-cache-v2";
const APP_SHELL = ["/", "/index.html"];

// ----------------------
// INSTALACIÓN (cachea App Shell)
// ----------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.error("Error al cachear App Shell:", err))
  );
  self.skipWaiting();
});

// ----------------------
// ACTIVACIÓN (limpia versiones antiguas del caché)
// ----------------------
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

// ----------------------
// IndexedDB helpers
// ----------------------
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("offlineDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pendingPosts")) {
        db.createObjectStore("pendingPosts", { autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (err) => reject(err);
  });
}

async function savePostRequest(data) {
  const db = await openDB();
  const tx = db.transaction("pendingPosts", "readwrite");
  tx.objectStore("pendingPosts").add(data);
  return tx.complete;
}

async function getAllPendingPosts() {
  const db = await openDB();
  const tx = db.transaction("pendingPosts", "readonly");
  const store = tx.objectStore("pendingPosts");
  return new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

async function clearPendingPosts() {
  const db = await openDB();
  const tx = db.transaction("pendingPosts", "readwrite");
  tx.objectStore("pendingPosts").clear();
  return tx.complete;
}

// ----------------------
// FETCH: manejar GET y POST
// ----------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Manejar GET normalmente (cache + red)
  if (request.method === "GET") {
    event.respondWith(
      caches.match(request).then((cacheRes) => {
        if (cacheRes) return cacheRes;

        return fetch(request)
          .then((networkRes) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, networkRes.clone());
              return networkRes;
            });
          })
          .catch(() => {
            if (request.mode === "navigate") {
              return caches.match("/index.html");
            }
          });
      })
    );
  }

  // Manejar POST offline
  if (request.method === "POST") {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        const body = await request.clone().json();
        console.log("[SW] Sin conexión, guardando POST en IndexedDB...");
        await savePostRequest({ url: request.url, body });

        if ("sync" in self.registration) {
          await self.registration.sync.register("sync-posts");
          console.log("[SW] Tarea de sincronización registrada ✅");
        }

        return new Response(
          JSON.stringify({ message: "Guardado localmente. Se enviará cuando haya conexión." }),
          { headers: { "Content-Type": "application/json" } }
        );
      })
    );
  }
});

// ----------------------
// SINCRONIZACIÓN (Background Sync)
// ----------------------
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-posts") {
    event.waitUntil(syncPendingPosts());
  }
});

async function syncPendingPosts() {
  console.log("[SW] Intentando reenviar POST pendientes...");

  const posts = await getAllPendingPosts();
  if (posts.length === 0) {
    console.log("[SW] No hay POST pendientes");
    return;
  }

  for (const post of posts) {
    try {
      await fetch(post.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post.body),
      });
      console.log("[SW] POST reenviado:", post.url);
    } catch (err) {
      console.error("[SW] Error reenviando:", err);
      return; // si falla uno, se reintenta más tarde
    }
  }

  await clearPendingPosts();
  console.log("[SW] Todos los POST reenviados y limpiados de IndexedDB ✅");
}

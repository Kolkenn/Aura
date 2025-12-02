// --- CONFIGURATION ---
const APP_VERSION = "v1.3.5"; // Bumped version
// ---------------------

const CACHE_NAME = `aura-tracker-${APP_VERSION}`;
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap",
];

self.addEventListener("install", (event) => {
  // FAULT TOLERANT INSTALLATION
  // We use this pattern so one failed file doesn't kill the whole app
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log(`[SW] Opening cache: ${CACHE_NAME}`);

      // Use a promise array to track success/failure
      const cachePromises = urlsToCache.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `Network response for ${url} was not ok: ${response.status}`
            );
          }
          return cache.put(url, response);
        } catch (error) {
          console.warn(`[SW] Failed to cache ${url}:`, error);
          // We intentionally do NOT throw here, allowing install to continue
        }
      });

      await Promise.all(cachePromises);
      console.log("[SW] Install completed");
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage(APP_VERSION);
  }
});

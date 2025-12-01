const CACHE_NAME = "aura-cycle-track-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdn.tailwindcss.com",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

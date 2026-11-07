const CACHE = "lean-mode-v8";
const ASSETS = [
  "/",
  "/index.html",
  "/src/main.js",
  "/src/store.js",
  "/src/food-estimator.js",
  "/src/idb.js",
  "/src/muscle-data.js",
  "/src/anatomy-svg.js",
  "/src/heatmap.js",
  "/src/recovery.js",
  "/src/style.css",
  "/manifest.webmanifest",
  "/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // If navigating to another page/route, fall back to /index.html from cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || caches.match("/index.html") || fetch(event.request))
    );
    return;
  }

  // Cache-first for local static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch((err) => {
        // Return empty response for non-critical assets if offline
        return new Response("", { status: 408, statusText: "Offline" });
      });
    })
  );
});

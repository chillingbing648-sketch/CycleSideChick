/**
 * CycleSideChick — Service Worker (Offline Cache & PWA Support)
 */

const CACHE_NAME = "cyclesidechick-v2.1.0";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./CycleSideChick.html",
  "./manifest.webmanifest",
  "./public/favicon.svg",
  "./public/cyclesidechick-infographic.svg",
  "./src/css/tokens.css",
  "./src/css/base.css",
  "./src/css/components.css",
  "./src/css/views.css",
  "./src/js/engine.js",
  "./src/js/storage.js",
  "./src/js/content.js",
  "./src/js/assistant.js",
  "./src/js/ui.js",
  "./src/js/app.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first for fresh updates, falling back to cache when offline
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (event.request.url.startsWith("http")) {
              cache.put(event.request, resClone);
            }
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || (event.request.mode === "navigate" ? caches.match("./index.html") : null);
        });
      })
  );
});

self.addEventListener("push", event => {
  let data = { title: "CycleSideChick Reminder", body: "Check in with your cycle today." };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./public/favicon.svg",
      badge: "./public/favicon.svg"
    })
  );
});

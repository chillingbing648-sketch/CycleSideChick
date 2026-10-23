/**
 * CycleSideChick — Service Worker (Offline Cache & PWA Support)
 */

const CACHE_NAME = "cyclesidechick-v3.0.0";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./CycleSideChick.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./cyclesidechick-infographic.svg",
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
  let data = {
    title: "CycleSideChick Companion",
    body: "Your cycle companion shared an update. Open to see how you can offer support today.",
    url: "./"
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./favicon.svg",
      badge: "./favicon.svg",
      data: data,
      tag: "cycle-companion-notification"
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

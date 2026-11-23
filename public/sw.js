// Kill switch for the old next-pwa service worker. The app no longer registers a service worker.
//
// Browsers that installed the old worker keep checking /sw.js for updates; this version
// clears its caches and unregisters itself so they stop serving a precached copy of the app.
//
// Keep this file in place so returning visitors can clean up. If you ever add real offline
// support, replace this file with the new worker (it should also delete the old caches).
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
    })(),
  );
});

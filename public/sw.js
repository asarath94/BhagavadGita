// cache-bust: dc208f3c76d38239-tkJ3B7HVLtbse2WXR3HsJ
// Line above is rewritten every build (see generate-precache-manifest.mjs)
// so this file's bytes always change on a new deploy, code or content —
// that's what makes the browser's SW update check notice a new version.
//
// Hand-rolled service worker: precaches the app shell (routes listed in
// precache-manifest.json, generated at build time) and cache-first serves
// everything else too, stashing network responses into a runtime cache so
// pages visited while online stay available offline.
const SHELL_PREFIX = "gita-shell-";
// ponytail: runtime cache is never trimmed or versioned, grows unbounded
// across builds. Add an entry-count/age cap if offline storage becomes a
// problem in practice.
const RUNTIME_CACHE = "gita-runtime";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch("/precache-manifest.json");
      const { version, buildId, urls } = await res.json();
      const cache = await caches.open(SHELL_PREFIX + version + "-" + buildId);
      await cache.addAll(urls);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch("/precache-manifest.json");
      const { version, buildId } = await res.json();
      const current = SHELL_PREFIX + version + "-" + buildId;
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(SHELL_PREFIX) && key !== current)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const res = await fetch(event.request);
      if (res.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(event.request, res.clone());
      }
      return res;
    })(),
  );
});

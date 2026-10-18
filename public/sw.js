/*
 * GetAJob service worker.
 *
 * Kept deliberately small. A service worker that caches too eagerly is the
 * classic way to serve a user a stale site forever, so:
 *   - API calls are never touched.
 *   - Pages are network-first, cache only as an offline fallback.
 *   - Only immutable build assets and brand images are cache-first.
 *
 * Bump VERSION to invalidate everything on the next visit.
 */
const VERSION = "getajob-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

self.addEventListener("install", () => {
  // Take over as soon as possible; the page is always network-first anyway.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API traffic — job counts, applications and health checks must
  // always be live.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(PAGE_CACHE);
            await cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          const cache = await caches.open(PAGE_CACHE);
          const cached = (await cache.match(request)) || (await cache.match("/"));
          return cached || Response.error();
        }
      })(),
    );
    return;
  }

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/");

  if (!isStatic) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;

      const fresh = await fetch(request);
      if (fresh.ok) await cache.put(request, fresh.clone());
      return fresh;
    })(),
  );
});

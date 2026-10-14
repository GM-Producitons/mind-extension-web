const CACHE = "me-shell-v2";
const OFFLINE_URL = "/offline.html";
const HOME_PATHS = new Set(["/", "/dashboard", "/offline", "/offline.html"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, url.pathname));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, pathname) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && !HOME_PATHS.has(pathname)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (HOME_PATHS.has(pathname)) return offlinePage();
    const cached = await cache.match(request);
    if (cached) return cached;
    return offlinePage();
  }
}

async function offlinePage() {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(OFFLINE_URL);
  if (cached) return cached;
  return fetch(OFFLINE_URL);
}

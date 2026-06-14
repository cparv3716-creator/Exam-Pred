const CACHE_NAME = "statstrive-static-v1";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icons/statstrive-192.png",
  "/icons/statstrive-512.png"
];

const NETWORK_ONLY_PREFIXES = [
  "/api/",
  "/auth/",
  "/dashboard",
  "/admin",
  "/payment",
  "/billing",
  "/pricing",
  "/login",
  "/logout",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (NETWORK_ONLY_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix))) {
    event.respondWith(fetch(request));
    return;
  }

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    /\.(?:png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/").then((fallback) => fallback || Response.error()))
    );
  }
});
const CACHE_NAME = "me-body-v2";
const STATIC_ASSETS = ["/", "/offline", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNav(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) { const cache = await caches.open(CACHE_NAME); cache.put(request, res.clone()); }
    return res;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

async function networkFirstNav(request) {
  try {
    const res = await fetch(request);
    if (res.ok) { const cache = await caches.open(CACHE_NAME); cache.put(request, res.clone()); }
    return res;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match("/offline");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) { const cache = await caches.open(CACHE_NAME); cache.put(request, res.clone()); }
    return res;
  } catch {
    return new Response("", { status: 408 });
  }
}

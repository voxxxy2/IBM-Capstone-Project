
const CACHE_NAME = 'granite-notes-v1';
const CORE_ASSETS = ['/', '/index.html', '/offline.html', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))))
  );
  self.clients.claim();
});

const isSameOrigin = (url) => new URL(url, self.location).origin === self.location.origin;

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('/index.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/index.html')) || (await cache.match('/offline.html'));
      }
    })());
    return;
  }

  if (isSameOrigin(url) && /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const fetchAndPut = fetch(req).then(res => {
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }).catch(() => undefined);
      return cached || fetchAndPut || fetch(req);
    })());
    return;
  }

  if (isSameOrigin(url)) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).catch(() => cached)));
  }
});

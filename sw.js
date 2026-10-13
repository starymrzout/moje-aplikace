// Technika Bus D: offline podpora a aktualizace obsahu, verze 2026-10-13.
// Zachovava localStorage (Leitnerovy hromadky): nikdy nemaze uzivatelska data.
const CACHE = 'technika-bus-d-v2026-10-13';
const HOME = new URL('./index.html', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add(new Request(HOME, {cache:'reload'}))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await fetch(req);
      if (fresh.ok) await cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      const cached = await cache.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const home = await cache.match(HOME);
        if (home) return home;
      }
      throw err;
    }
  })());
});

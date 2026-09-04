// Only this app's assets are cached. Google Apps Script requests use the network.
const PREFIX = 'gg-panel:' + self.registration.scope + ':';
const CACHE = PREFIX + '2026-09-04-2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png',
  './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Keep one consistent shell version until the next worker activates.
    if (event.request.mode === 'navigate') return await cache.match('./index.html') || fetch(event.request);
    return await cache.match(event.request) || fetch(event.request);
  })());
});

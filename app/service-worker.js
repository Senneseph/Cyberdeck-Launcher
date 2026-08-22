// Cyberdeck Launcher service worker — caches the app shell for offline use.
const CACHE = 'launcher-v1';
const SHELL = [
  '/Cyberdeck-Launcher/app/index.html',
  '/Cyberdeck-Launcher/app/main.js',
  '/Cyberdeck-Launcher/app/manifest.json',
  '/jcule/dist/index.js',
  '/jellicule/dist/index.js',
  '/memory-core/dist/index.js',
  '/cyber-eyes/dist/index.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request))
  );
});

const CACHE = 'imds-school-manager-v1';
const ASSETS = ['./','./index.html','./manifest.json','./css/style.css','./js/database.js','./js/app.js','./js/service-worker-register.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html'))));
});
// OneSignal push worker + Convoy offline fallback (a single service worker so
// they don't fight over the root scope).
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const OFFLINE_URL = '/offline.html';
const CACHE = 'convoy-offline-v1';

// Pre-cache the offline page.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)));
  self.skipWaiting();
});

// Drop old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// For page navigations, try the network; if offline, show the fallback page.
// The landing page ("/") is left untouched so it always loads from the network.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    if (url.pathname === '/') return; // don't intercept the landing page
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

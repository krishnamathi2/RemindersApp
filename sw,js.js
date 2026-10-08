// sw.js - Service Worker for Reminder App

const CACHE_NAME = 'reminder-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/Welcome.html',
  '/voice-assistant.html',
  '/text-mode.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install event - caching assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
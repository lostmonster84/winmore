// OUTPOST Trading System - Service Worker
// Simple service worker for PWA functionality

const CACHE_NAME = 'winmore-v1';
const urlsToCache = [
  '/',
  '/login',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('WinMore: Service worker cache opened');
        return cache.addAll(urlsToCache.filter(url => url !== '/icon-192x192.png' && url !== '/icon-512x512.png')); // Skip icons that don't exist yet
      })
      .catch((error) => {
        console.log('WinMore: Service worker install failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('WinMore: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
// Countdown Timer - Service Worker
// Handles background push notifications and PWA caching

const CACHE_NAME = 'countdown-timer-v1';
const ASSETS = ['./', './index.html', './manifest.json'];

// Cache app files on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Show notification when timer fires (sent via postMessage or push)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Timer done', {
      body: data.body || 'Your countdown has finished.',
      icon: data.icon || './icon-192.png',
      badge: data.badge || './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'countdown-done',
      renotify: true
    })
  );
});

// Allow the page to trigger a notification directly (no push server needed)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'TIMER_DONE') {
    self.registration.showNotification('Timer done', {
      body: 'Your countdown has finished.',
      vibrate: [200, 100, 200],
      tag: 'countdown-done',
      renotify: true
    });
  }
});

// Handle notification tap — focus or open the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

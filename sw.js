// Countdown Timer - Service Worker
const CACHE_NAME = 'countdown-timer-v2';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// ── Scheduled notification (survives screen-off) ──
let notifTimer = null;

self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SCHEDULE') {
    // Clear any existing scheduled notification
    if (notifTimer) clearTimeout(notifTimer);
    const ms = event.data.seconds * 1000;
    notifTimer = setTimeout(() => {
      self.registration.showNotification('Timer done', {
        body: 'Your countdown has finished.',
        vibrate: [200, 100, 200],
        tag: 'countdown-done',
        renotify: true
      });
      notifTimer = null;
    }, ms);
  }

  if (event.data.type === 'CANCEL') {
    if (notifTimer) { clearTimeout(notifTimer); notifTimer = null; }
  }

  if (event.data.type === 'TIMER_DONE') {
    self.registration.showNotification('Timer done', {
      body: 'Your countdown has finished.',
      vibrate: [200, 100, 200],
      tag: 'countdown-done',
      renotify: true
    });
  }
});

// Handle notification tap
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

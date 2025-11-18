// Service Worker for Artful Agenda
// Provides offline functionality and push notifications

const CACHE_NAME = 'artful-agenda-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'Artful Agenda';
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      tag: data.tag || 'artful-agenda-notification',
      data: data.data || {},
      actions: data.actions || [],
      timestamp: data.timestamp || Date.now(),
      requireInteraction: data.requireInteraction || false,
      vibrate: data.vibrate || [200, 100, 200],
      renotify: data.renotify || false
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'snooze') {
    // Schedule a new notification for later
    const snoozeTime = Date.now() + 15 * 60 * 1000; // 15 minutes
    setTimeout(() => {
      self.registration.showNotification('Reminder', {
        body: event.notification.body,
        icon: event.notification.icon,
        badge: event.notification.badge
      });
    }, 15 * 60 * 1000);
  } else if (event.action === 'complete') {
    // Mark task as complete
    console.log('Task completed from notification');
  } else {
    // Handle notification click (default action)
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Message event - handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      self.registration.showNotification(
        event.data.title,
        event.data.options
      )
    );
  }
  
  if (event.data && event.data.type === 'SYNC_DATA') {
    // Handle data synchronization
    console.log('Syncing data in service worker');
  }
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // Schedule a notification for a specific time
    const { title, options, timestamp } = event.data;
    const delay = timestamp - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification(title, options);
      }, delay);
    }
  }
  
  if (event.data && event.data.type === 'ENHANCED_NOTIFICATION') {
    // Handle enhanced notifications with actions
    const { title, options } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
  
  if (event.data && event.data.type === 'GEOFENCE_NOTIFICATION') {
    const { title, body } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png'
      })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Perform background sync operations
      syncData()
    );
  }
});

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-events') {
    event.waitUntil(
      checkForUpcomingEvents()
    );
  }
});

// Function to sync data in the background
async function syncData() {
  console.log('Performing background sync');
  // In a real app, this would sync pending changes with the server
}

// Function to check for upcoming events
async function checkForUpcomingEvents() {
  console.log('Checking for upcoming events');
  // In a real app, this would check for events and send notifications
}

// Handle background fetch
self.addEventListener('backgroundfetchsuccess', (event) => {
  console.log('Background fetch successful');
});

self.addEventListener('backgroundfetchfail', (event) => {
  console.log('Background fetch failed');
});
// Service Worker for Proprietary AI Model Strategy PWA
// =====================================================
// Increment VERSION to force update push to all clients
const VERSION = '1.7.8';
const CACHE_NAME = `ai-strategy-v${VERSION}`;
const OFFLINE_URL = '/index.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/training.html',
  '/scientific.html',
  '/hardware.html',
  '/cloud.html',
  '/legal.html',
  '/readme.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Check for updates interval (in milliseconds)
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Immediately activate new SW
  );
});

// Activate event - clean up old caches and notify clients
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${VERSION}`);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('ai-strategy-')) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control of all clients immediately
      .then(() => {
        // Notify all clients about the update
        return notifyAllClients({
          type: 'SW_UPDATED',
          version: VERSION
        });
      })
  );
});

// Fetch event - network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Network-first strategy for HTML pages (always get fresh content)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Stale-while-revalidate for other assets
  event.respondWith(staleWhileRevalidate(event.request));
});

// Network-first: Try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback to offline page
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    throw error;
  }
}

// Stale-while-revalidate: Return cache immediately, update in background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
        
        // Check if content changed and notify clients
        if (cachedResponse) {
          checkForContentChange(cachedResponse, networkResponse.clone(), request.url);
        }
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  // Return cached version immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Compare responses to detect content changes
async function checkForContentChange(oldResponse, newResponse, url) {
  try {
    const oldText = await oldResponse.clone().text();
    const newText = await newResponse.clone().text();
    
    if (oldText !== newText) {
      console.log('[SW] Content changed:', url);
      notifyAllClients({
        type: 'CONTENT_UPDATED',
        url: url,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.log('[SW] Error comparing content:', error);
  }
}

// Notify all connected clients
async function notifyAllClients(message) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  
  console.log(`[SW] Notifying ${clients.length} clients:`, message.type);
  
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.source.postMessage({
        type: 'VERSION_INFO',
        version: VERSION,
        cacheName: CACHE_NAME
      });
      break;
      
    case 'FORCE_UPDATE':
      // Force refresh all caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        notifyAllClients({
          type: 'CACHE_CLEARED',
          message: 'Please refresh to get the latest content'
        });
      });
      break;
      
    case 'CHECK_FOR_UPDATES':
      checkForUpdates();
      break;
  }
});

// Periodic update check
async function checkForUpdates() {
  console.log('[SW] Checking for updates...');
  
  try {
    // Fetch the service worker file to check for changes
    const response = await fetch('/service-worker.js', { cache: 'no-store' });
    const newSwText = await response.text();
    
    // Extract version from the new service worker
    const versionMatch = newSwText.match(/const VERSION = ['"](.+?)['"]/);
    if (versionMatch && versionMatch[1] !== VERSION) {
      console.log(`[SW] New version available: ${versionMatch[1]}`);
      notifyAllClients({
        type: 'UPDATE_AVAILABLE',
        currentVersion: VERSION,
        newVersion: versionMatch[1]
      });
    }
  } catch (error) {
    console.log('[SW] Update check failed:', error);
  }
}

// Schedule periodic update checks when active
self.addEventListener('activate', () => {
  // Initial check after 5 seconds
  setTimeout(checkForUpdates, 5000);
});

const CACHE_NAME = 'english-app-v3.1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './main.js',
    './styles/app.css',
    './styles/toast.css',
    './styles/add-word.css',
    './data/wordsData.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// 1. Install Event: Cache core assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching files');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Ignroe non-http requests (like extensions)
    if (!event.request.url.startsWith('http')) return;

    // Ignore API calls (Vercel / GitHub Models) - let them go to network
    if (event.request.url.includes('vercel.app') || event.request.url.includes('api')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if found
            if (response) {
                return response;
            }
            // Otherwise fetch from network
            return fetch(event.request);
        })
    );
});

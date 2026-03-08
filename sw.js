// ============================================================
// sw.js — Service Worker for Card Scanner PWA
// ============================================================

const CACHE_NAME = 'card-scanner-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/config.js',
    './js/auth.js',
    './js/ocr.js',
    './js/parser.js',
    './js/vcf.js',
    './js/storage.js',
    './js/email.js',
    './js/app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install — cache app shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch — cache-first for static, network-first for CDN
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Network-first for CDN resources (Tesseract, EmailJS)
    if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('unpkg.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for local assets
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});

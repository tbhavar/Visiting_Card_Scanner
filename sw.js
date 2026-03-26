// ============================================================
// sw.js — Service Worker for Card Scanner PWA
// ============================================================

const CACHE_NAME = 'card-scanner-v1.1';
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
    './icons/icon-512.png',
    './profile.jpg'
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

// Fetch — Stale-While-Revalidate for local, Network-first for CDN
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Network-first for CDN resources (Tesseract, EmailJS)
    if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('unpkg.com') || url.hostname.includes('emailjs.com')) {
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

    // Stale-While-Revalidate for local assets
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                return response || fetchPromise;
            });
        })
    );
});

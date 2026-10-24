// Siddhohum Cafe Progressive Web App Service Worker
const CACHE_NAME = 'siddhohum-cafe-shell-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.webmanifest'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // SECURITY RULE: Never cache sensitive API endpoints, auth tokens, or private order updates
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Network connection is currently unavailable. Please check your internet.'
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          }
        )
      })
    )
    return
  }

  // Network-first for dynamic navigation, cache fallback for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }
      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic' ||
          event.request.method !== 'GET'
        ) {
          return networkResponse
        }
        return networkResponse
      })
    })
  )
})

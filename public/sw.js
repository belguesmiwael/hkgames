const CACHE_NAME = 'hkgames-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:               data.body,
      icon:               data.icon || '/icons/hk-logo-192.png',
      badge:              data.badge || '/icons/badge-72.png',
      tag:                data.tag,
      data:               data.data,
      actions:            data.actions,
      vibrate:            data.vibrate || [200, 100, 200],
      requireInteraction: data.requireInteraction || false,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/admin/commandes'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url.includes('/admin'))
        if (existing) {
          existing.focus()
          existing.navigate(url)
        } else {
          clients.openWindow(url)
        }
      })
  )
})

// Notification Event Handlers
declare const clients: ServiceWorkerGlobalScope['clients']

export class NotificationHandlers {
  // Handle notification click (for service worker)
  static handleNotificationClick(event: NotificationEvent): void {
    event.notification.close()

    const data = event.notification.data || {}

    if (data.type === 'word-review') {
      // Open app to review words
      const urlToOpen = `/?review=${data.contextIds.join(',')}&alert=${
        data.alertId
      }`

      event.waitUntil(
        clients.matchAll().then((clientList: readonly Client[]) => {
          // Check if app is already open
          for (const client of clientList) {
            if (
              client.url.includes('/') &&
              'focus' in client &&
              'navigate' in client
            ) {
              const windowClient = client as WindowClient
              windowClient.navigate(urlToOpen)
              return windowClient.focus()
            }
          }

          // Open new window/tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
      )
    }
  }
}

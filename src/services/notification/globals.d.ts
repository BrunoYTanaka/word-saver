// Global Service Worker Types
declare global {
  interface WindowClient extends Client {
    navigate(url: string): Promise<WindowClient>
    focus(): Promise<WindowClient>
  }

  interface ServiceWorkerGlobalScope {
    clients: Clients
  }

  interface NotificationEvent extends ExtendableEvent {
    notification: Notification
    action?: string
  }

  interface Clients {
    matchAll(options?: ClientQueryOptions): Promise<readonly Client[]>
    openWindow(url: string): Promise<WindowClient | null>
  }
}

export {}

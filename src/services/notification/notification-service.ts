// Core Notification Service
import type {
  INotificationService,
  NotificationOptions,
  PermissionStatus
} from './types'

export class NotificationService implements INotificationService {
  public permission: NotificationPermission = 'default'
  public readonly isSupported: boolean = 'Notification' in window

  constructor() {
    this.permission = 'default'
    this.isSupported = 'Notification' in window
  }

  // Initialize notification service
  async init() {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser')
      return false
    }

    this.permission = Notification.permission

    if (this.permission === 'default') {
      this.permission = await this.requestPermission()
    }

    return this.permission === 'granted'
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied'

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  // Show immediate notification
  showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Notification | null {
    if (this.permission !== 'granted') return null

    const defaultOptions = {
      badge: '/pwa-192x192.png',
      icon: '/pwa-192x192.png',
      dir: 'ltr' as NotificationDirection,
      lang: 'pt-BR',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false,
      ...options
    }

    try {
      const notification = new Notification(title, defaultOptions)

      // Auto close after 5 seconds if not interactive
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => notification.close(), 5000)
      }

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }

  // Check if notifications are supported and enabled
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted'
  }

  // Get permission status
  getPermissionStatus(): PermissionStatus {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isEnabled()
    }
  }
}

import type {
  NotificationData,
  NotificationOptions,
  PermissionStatus
} from './types'

export class CoreNotificationService {
  public permission: NotificationPermission = 'default'
  public readonly isSupported: boolean = 'Notification' in window

  constructor() {
    this.permission = this.isSupported ? Notification.permission : 'denied'
  }

  // Initialize notification service
  async init(): Promise<boolean> {
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

  // Show notification using browser notifications
  async showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    if (!this.isEnabled()) {
      console.warn('Notifications not enabled')
      return
    }

    const defaultOptions: NotificationOptions = {
      badge: '/pwa-192x192.png',
      icon: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false,
      ...options
    }

    try {
      // Use native browser notifications
      console.log('Showing browser notification', {
        title,
        options: defaultOptions
      })
      const notification = new Notification(title, defaultOptions)

      notification.onclick = (event) => {
        console.log('Notification clicked', defaultOptions.data)
        event.preventDefault()
        notification.close()
        this.handleNotificationClick(defaultOptions.data || {})
      }

      // Auto close after 5 seconds if not interactive
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => notification.close(), 5000)
      }
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  // Handle notification click — dispatch in-app event so React Router handles navigation
  private handleNotificationClick(data: NotificationData): void {
    console.log('Handling notification click:', data)

    if (window.focus) {
      window.focus()
    }

    if (data.type === 'word-review' && data.contextIds?.length) {
      const event = new CustomEvent('word-saver:review', {
        detail: {
          contextIds: data.contextIds,
          alertId: data.alertId
        }
      })

      window.dispatchEvent(event)
      if (!window.__WORD_SAVER_REVIEW_LISTENER__) {
        const params = new URLSearchParams({
          review: data.contextIds.join(',')
        })
        if (data.alertId) params.set('alert', data.alertId)
        window.location.href = `${
          window.location.origin
        }/dashboard?${params.toString()}`
      }
    }
  }

  // Convenience methods for specific notification types
  async showWordReviewReminder(
    wordCount: number,
    contexts: string
  ): Promise<void> {
    await this.showNotification('📚 Revisar Palavras', {
      body: `${wordCount} palavras em ${contexts} precisam de revisão`,
      data: { type: 'review-reminder' }
    })
  }

  async showCongratsNotification(milestone: string): Promise<void> {
    await this.showNotification('🎉 Parabéns!', {
      body: milestone,
      data: { type: 'congratulations' }
    })
  }

  // Utility methods
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted'
  }

  getPermissionStatus(): PermissionStatus {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isEnabled()
    }
  }
}

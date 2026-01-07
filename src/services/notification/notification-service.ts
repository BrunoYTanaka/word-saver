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

      notification.onclick = (e: Event) => {
        e.preventDefault()
        notification.close()

        // Obter dados da notificação do defaultOptions
        const data = defaultOptions.data || {}

        console.log('Notification clicked with data:', data)

        if (data.type === 'word-review') {
          // Redirecionar para página de revisão
          const reviewParams = data.contextIds ? data.contextIds.join(',') : ''
          const alertId = data.alertId || ''
          const reviewUrl = `${window.location.origin}/?review=${reviewParams}&alert=${alertId}`

          console.log('Navigating to:', reviewUrl)

          // Focar na janela atual
          if (window.focus) {
            window.focus()
          }

          // Navegar para a URL de revisão
          window.location.href = reviewUrl
        } else if (data.type === 'review-reminder') {
          // Para reminder, apenas focar na janela atual
          if (window.focus) {
            window.focus()
          }
          // Opcional: navegar para uma página específica
          window.location.href = window.location.origin
        } else if (data.type === 'congratulations') {
          // Para parabéns, apenas focar na janela
          if (window.focus) {
            window.focus()
          }
        } else {
          // Fallback: apenas focar na aplicação
          if (window.focus) {
            window.focus()
          }
        }
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

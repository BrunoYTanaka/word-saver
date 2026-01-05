// Main Notification Service - Composed Service
import { NotificationService } from './notification-service'
import { AlertScheduler } from './alert-scheduler'
import { NotificationHandlers } from './notification-handlers'
import { NotificationTypes } from './notification-types'
import type { Alert, NotificationOptions, PermissionStatus } from './types'

class ComposedNotificationService {
  public readonly core: NotificationService
  public readonly scheduler: AlertScheduler
  public readonly types: NotificationTypes
  public readonly handlers = NotificationHandlers

  constructor() {
    this.core = new NotificationService()
    this.scheduler = new AlertScheduler(this.core)
    this.types = new NotificationTypes(this.core)
    this.handlers = NotificationHandlers
  }

  // Initialize all services
  async init(): Promise<boolean> {
    const initialized = await this.core.init()

    if (initialized) {
      await this.scheduler.scheduleExistingAlerts()
    }

    return initialized
  }

  // Delegate core methods
  async requestPermission(): Promise<NotificationPermission> {
    return await this.core.requestPermission()
  }

  showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Notification | null {
    return this.core.showNotification(title, options)
  }

  isEnabled(): boolean {
    return this.core.isEnabled()
  }

  getPermissionStatus(): PermissionStatus {
    return this.core.getPermissionStatus()
  }

  // Delegate scheduler methods
  async scheduleAlert(alert: Alert): Promise<boolean> {
    return await this.scheduler.scheduleAlert(alert)
  }

  cancelAlert(alertId: string): boolean {
    return this.scheduler.cancelAlert(alertId)
  }

  async rescheduleAlerts(): Promise<void> {
    return await this.scheduler.rescheduleAlerts()
  }

  // Delegate notification type methods
  showWordReviewReminder(
    wordCount: number,
    contexts: string
  ): Notification | null {
    return this.types.showWordReviewReminder(wordCount, contexts)
  }

  showCongratsNotification(milestone: string): Notification | null {
    return this.types.showCongratsNotification(milestone)
  }

  // Static method for service worker
  static handleNotificationClick(event: NotificationEvent): void {
    return NotificationHandlers.handleNotificationClick(event)
  }
}

// Create singleton instance
const notificationService = new ComposedNotificationService()

export default notificationService

import { CoreNotificationService } from './core-notification-service'
import { AlertScheduler } from './alert-scheduler'
import type { NotificationOptions, PermissionStatus } from './types'
import { FullAlert } from '../../types/alert'

class NotificationService {
  private core: CoreNotificationService
  private scheduler: AlertScheduler

  constructor() {
    this.core = new CoreNotificationService()
    this.scheduler = new AlertScheduler(this.core)
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

  async showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    return await this.core.showNotification(title, options)
  }

  isEnabled(): boolean {
    return this.core.isEnabled()
  }

  getPermissionStatus(): PermissionStatus {
    return this.core.getPermissionStatus()
  }

  // Delegate scheduler methods
  async scheduleAlert(alert: FullAlert): Promise<boolean> {
    return await this.scheduler.scheduleAlert(alert)
  }

  cancelAlert(alertId: string): boolean {
    return this.scheduler.cancelAlert(alertId)
  }

  async rescheduleAlerts(): Promise<void> {
    return await this.scheduler.rescheduleAlerts()
  }

  // Delegate notification type methods
  async showWordReviewReminder(
    wordCount: number,
    contexts: string
  ): Promise<void> {
    return await this.core.showWordReviewReminder(wordCount, contexts)
  }

  async showCongratsNotification(milestone: string): Promise<void> {
    return await this.core.showCongratsNotification(milestone)
  }
}

// Create singleton instance
const notificationService = new NotificationService()
export default notificationService

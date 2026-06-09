import { CoreNotificationService } from './core-notification-service'
import { AlertScheduler } from './alert-scheduler'
import { FullAlert } from '../../../features/alerts/types/alert'
import type { NotificationOptions, PermissionStatus } from './types'

class NotificationService {
  private core: CoreNotificationService
  private scheduler: AlertScheduler

  constructor() {
    this.core = new CoreNotificationService()
    this.scheduler = new AlertScheduler(this.core)
  }

  async init(): Promise<boolean> {
    const initialized = await this.core.init()

    if (initialized) {
      await this.scheduler.scheduleExistingAlerts()
    }

    return initialized
  }

  isEnabled(): boolean {
    return this.core.isEnabled()
  }

  getPermissionStatus(): PermissionStatus {
    return this.core.getPermissionStatus()
  }

  async requestPermission(): Promise<NotificationPermission> {
    return this.core.requestPermission()
  }

  async showNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    return this.core.showNotification(title, options)
  }

  async scheduleAlert(alert: FullAlert): Promise<boolean> {
    return await this.scheduler.scheduleAlert(alert)
  }

  cancelAlert(alertId: string): boolean {
    return this.scheduler.cancelAlert(alertId)
  }

  async rescheduleAlerts(): Promise<void> {
    return await this.scheduler.rescheduleAlerts()
  }

  async triggerAlertNow(alert: FullAlert): Promise<void> {
    return this.scheduler.triggerAlertNow(alert)
  }
}

export default new NotificationService()

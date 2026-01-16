import { CoreNotificationService } from './core-notification-service'
import { AlertScheduler } from './alert-scheduler'
import { FullAlert } from '../../../features/alerts/types/alert'

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

  async isEnabled(): Promise<boolean> {
    return this.core.isEnabled()
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
}

export default new NotificationService()

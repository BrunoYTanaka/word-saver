// Alert Scheduler Service
import { FullAlert } from '../../types/alert'
import { dbService } from '../db'
import { CoreNotificationService } from './core-notification-service'

export class AlertScheduler {
  private scheduledAlerts: Map<string, ReturnType<typeof setTimeout>> =
    new Map()
  private notificationService: CoreNotificationService

  constructor(notificationService: CoreNotificationService) {
    this.notificationService = notificationService
  }

  // Schedule alert for word review
  async scheduleAlert(alert: FullAlert): Promise<boolean> {
    if (!this.notificationService.isEnabled()) return false

    try {
      const now = new Date()
      const [hours, minutes] = alert.time.split(':').map(Number)

      const nextTrigger = new Date()
      nextTrigger.setHours(hours, minutes, 0, 0)

      // If time has passed today, schedule for tomorrow
      if (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + 1)
      }

      // For weekly alerts, adjust to next occurrence
      if (alert.frequency === 'weekly') {
        const dayOfWeek = alert.days || [new Date().getDay()]
        const currentDay = nextTrigger.getDay()
        const targetDay = dayOfWeek[0]

        const daysUntilTarget = (targetDay - currentDay + 7) % 7
        if (daysUntilTarget === 0 && nextTrigger <= now) {
          nextTrigger.setDate(nextTrigger.getDate() + 7)
        } else {
          nextTrigger.setDate(nextTrigger.getDate() + daysUntilTarget)
        }
      }

      const timeoutId = setTimeout(async () => {
        await this.triggerAlert(alert)
      }, nextTrigger.getTime() - now.getTime())

      this.scheduledAlerts.set(alert.id, timeoutId)

      console.log(`Alert scheduled for ${nextTrigger.toLocaleString()}`)
      return true
    } catch (error) {
      console.error('Error scheduling alert:', error)
      return false
    }
  }

  // Trigger scheduled alert
  private async triggerAlert(alert: FullAlert): Promise<void> {
    try {
      // Get words from selected contexts
      const wordsPromises = alert.contextIds.map((contextId) =>
        dbService.words.getWordsByContext(contextId)
      )
      const wordArrays = await Promise.all(wordsPromises)
      const allWords = wordArrays.flat()

      if (allWords.length === 0) {
        console.log('No words found for alert contexts')
        return
      }

      // Get context names
      const contexts = await Promise.all(
        alert.contextIds.map((id) => dbService.contexts.get(id))
      )
      const contextNames = contexts
        .map((ctx) => ctx?.name)
        .filter(Boolean)
        .join(', ')

      // Show notification
      await this.notificationService.showNotification(
        `🧠 Hora de revisar palavras!`,
        {
          body: `${allWords.length} palavras de ${contextNames} aguardando revisão`,
          data: {
            type: 'word-review',
            alertId: alert.id,
            contextIds: alert.contextIds,
            words: allWords
          },
          actions: [
            {
              action: 'review',
              title: 'Revisar Agora'
            },
            {
              action: 'later',
              title: 'Mais Tarde'
            }
          ],
          requireInteraction: true
        }
      )

      // Update alert last triggered
      await dbService.alerts.updateAlertLastTriggered(alert.id)

      // Reschedule for next occurrence
      if (alert.isActive) {
        await this.scheduleAlert(alert)
      }
    } catch (error) {
      console.error('Error triggering alert:', error)
    }
  }

  // Cancel scheduled alert
  cancelAlert(alertId: string): boolean {
    const timeoutId = this.scheduledAlerts.get(alertId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.scheduledAlerts.delete(alertId)
      return true
    }
    return false
  }

  // Schedule all existing alerts
  async scheduleExistingAlerts(): Promise<void> {
    if (!this.notificationService.isEnabled()) return

    try {
      const activeAlerts = await dbService.alerts.getActiveAlerts()

      for (const alert of activeAlerts) {
        await this.scheduleAlert(alert)
      }

      console.log(`Scheduled ${activeAlerts.length} alerts`)
    } catch (error) {
      console.error('Error scheduling existing alerts:', error)
    }
  }

  // Reschedule all alerts
  async rescheduleAlerts(): Promise<void> {
    // Cancel all existing schedules
    this.scheduledAlerts.forEach((timeoutId) => clearTimeout(timeoutId))
    this.scheduledAlerts.clear()

    // Reschedule active alerts
    await this.scheduleExistingAlerts()
  }
}

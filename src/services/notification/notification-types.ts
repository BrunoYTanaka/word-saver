// Specific Notification Types
import type { INotificationTypes, INotificationService } from './types'

export class NotificationTypes implements INotificationTypes {
  private notificationService: INotificationService

  constructor(notificationService: INotificationService) {
    this.notificationService = notificationService
  }

  // Show word review reminder
  showWordReviewReminder(
    wordCount: number,
    contexts: string
  ): Notification | null {
    return this.notificationService.showNotification('📚 Revisar Palavras', {
      body: `${wordCount} palavras em ${contexts} precisam de revisão`,
      data: { type: 'review-reminder' },
      actions: [
        { action: 'review', title: 'Revisar' },
        { action: 'dismiss', title: 'Dispensar' }
      ]
    })
  }

  // Show congratulations notification
  showCongratsNotification(milestone: string): Notification | null {
    return this.notificationService.showNotification('🎉 Parabéns!', {
      body: milestone,
      data: { type: 'congratulations' }
    })
  }
}

// Notification Service Types
export interface NotificationOptions {
  badge?: string
  icon?: string
  dir?: NotificationDirection
  lang?: string
  vibrate?: number[]
  requireInteraction?: boolean
  silent?: boolean
  body?: string
  data?: NotificationData
  actions?: NotificationAction[]
}

export interface NotificationData {
  type?: string
  alertId?: string
  contextIds?: string[]
  wordCount?: number
  [key: string]: unknown
}

export interface NotificationAction {
  action: string
  title: string
}

export interface Alert {
  id: string
  time: string
  frequency: 'daily' | 'weekly'
  days?: number[]
  contextIds: string[]
  isActive: boolean
}

export interface Context {
  id: string
  name: string
}

export interface Word {
  id: string
  contextId: string
  word: string
  definition?: string
}

export interface PermissionStatus {
  supported: boolean
  permission: NotificationPermission
  enabled: boolean
}

export interface INotificationService {
  permission: NotificationPermission
  isSupported: boolean
  init(): Promise<boolean>
  requestPermission(): Promise<NotificationPermission>
  showNotification(
    title: string,
    options?: NotificationOptions
  ): Notification | null
  isEnabled(): boolean
  getPermissionStatus(): PermissionStatus
}

export interface IAlertScheduler {
  scheduleAlert(alert: Alert): Promise<boolean>
  cancelAlert(alertId: string): boolean
  triggerAlert(alert: Alert): Promise<void>
  scheduleExistingAlerts(): Promise<void>
  rescheduleAlerts(): Promise<void>
}

export interface INotificationTypes {
  showWordReviewReminder(
    wordCount: number,
    contexts: string
  ): Notification | null
  showCongratsNotification(milestone: string): Notification | null
}

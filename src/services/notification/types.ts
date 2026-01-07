// Notification Service Types

export interface NotificationData {
  type?: 'word-review' | 'review-reminder' | 'congratulations'
  alertId?: string
  contextIds?: string[]
  wordCount?: number
  [key: string]: unknown
}

export interface NotificationOptions {
  body?: string
  badge?: string
  icon?: string
  data?: NotificationData
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
}

export interface NotificationAction {
  action: string
  title: string
}

export interface PermissionStatus {
  supported: boolean
  permission: NotificationPermission
  enabled: boolean
}

export interface Alert {
  name: string
  frequency: 'daily' | 'weekly'
  time: string // "HH:MM" format
  contextIds: string[]
  days: number[] // Default weekdays for weekly alerts (Monday to Friday)
}

export interface FullAlert extends Alert {
  id: string
  message: string
  createdAt: string
  updatedAt: string
  lastTriggered: string | null
  isActive: boolean
}

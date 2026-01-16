export interface BackupData {
  words: any[]
  contexts: any[]
  alerts: any[]
  settings: any[]
  flashcards?: any[]
  quiz?: any[]
  timestamp: string
  version: string
}

export interface BackupOptions {
  includeWords: boolean
  includeContexts: boolean
  includeAlerts: boolean
  includeSettings: boolean
  includeFlashcards?: boolean
  includeQuiz?: boolean
  compress?: boolean
}

export interface BackupMetadata {
  id: string
  name: string
  createdAt: string
  size: number
  itemCount: number
  description?: string
}

export interface BackupData {
  words: unknown[]
  contexts: unknown[]
  alerts: unknown[]
  settings: unknown[]
  flashcards?: unknown[]
  quiz?: unknown[]
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

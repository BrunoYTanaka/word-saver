import { DB_VERSION } from '@/core/database'
import { AlertStore } from '@/features/alerts'
import { SettingStore } from '@/features/settings'
import {
  FullWord,
  FullContext,
  WordStore,
  ContextStore
} from '@/features/vocabulary'

class ExportService {
  async exportData() {
    const data = {
      words: await WordStore.getAll(),
      contexts: await ContextStore.getAll(),
      alerts: await AlertStore.getAll(),
      settings: await SettingStore.getSettings(),
      exportedAt: new Date().toISOString(),
      version: DB_VERSION
    }
    return data
  }

  async exportContextData(contextId: string): Promise<{
    context: FullContext
    words: FullWord[]
    exportedAt: string
    type: string
  }> {
    const words = await WordStore.getWordsByContext(contextId)
    const context = await ContextStore.get(contextId)

    return {
      context,
      words,
      exportedAt: new Date().toISOString(),
      type: 'context-export'
    }
  }
}

export default new ExportService()

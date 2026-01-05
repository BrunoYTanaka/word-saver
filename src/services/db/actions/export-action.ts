import { FullContext } from '../../../types/Context'
import { FullWord } from '../../../types/Word'
import { DB_VERSION } from '../config/database'

import AlertService from './alert-action'
import ContextService from './context-action'
import SettingService from './settings-action'
import WordService from './word-action'

class ExportImportAction {
  async exportData() {
    const data = {
      words: await WordService.getAll(),
      contexts: await ContextService.getAll(),
      alerts: await AlertService.getAll(),
      settings: await SettingService.getSettings(),
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
    const words = await WordService.getWordsByContext(contextId)
    const context = await ContextService.get<FullContext>(contextId)

    return {
      context,
      words,
      exportedAt: new Date().toISOString(),
      type: 'context-export'
    }
  }
}

export default new ExportImportAction()

import { FullContext } from '../../../../features/vocabulary/contexts/types/context'
import { FullWord } from '../../../../features/vocabulary/words/types/word'
import { DB_VERSION } from '../../../../core/database/config/database'

import AlertService from '../../../alerts/services/alert-action'
import ContextService from '../../../vocabulary/contexts/services/context-action'
import SettingService from '../../../settings/services/settings-action'
import WordService from '../../../vocabulary/words/services/word-action'

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

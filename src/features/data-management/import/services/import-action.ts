import { FullAlert } from '../../../alerts/types/alert'
import { FullContext } from '../../../vocabulary/contexts/types/context'
import { FullWord } from '../../../vocabulary/words/types/word'
import { STORES } from '../../../../core/database/config/database'
import database from '../../../../core/database/core/database'

interface Data {
  words?: FullWord[]
  contexts?: FullContext[]
  alerts?: FullAlert[]
  settings?: { [key: string]: string }[]
}

type Mode = 'merge' | 'replace'

class ExportImportAction {
  async importData(
    data: Data,
    mode: Mode = 'merge'
  ): Promise<{
    success: boolean
    imported: number
  }> {
    const transaction = database.db!.transaction(
      [STORES.WORDS, STORES.CONTEXTS, STORES.ALERTS, STORES.SETTINGS],
      'readwrite'
    )

    try {
      if (mode === 'replace') {
        // Clear existing data
        await Promise.all([
          transaction.objectStore(STORES.WORDS).clear(),
          transaction.objectStore(STORES.CONTEXTS).clear(),
          transaction.objectStore(STORES.ALERTS).clear(),
          transaction.objectStore(STORES.SETTINGS).clear()
        ])
      }

      // Import data
      const imports: IDBRequest<IDBValidKey>[] = []

      if (data.contexts) {
        data.contexts.forEach((context) => {
          imports.push(transaction.objectStore(STORES.CONTEXTS).put(context))
        })
      }

      if (data.words) {
        data.words.forEach((word) => {
          imports.push(transaction.objectStore(STORES.WORDS).put(word))
        })
      }

      if (data.alerts) {
        data.alerts.forEach((alert) => {
          imports.push(transaction.objectStore(STORES.ALERTS).put(alert))
        })
      }

      if (data.settings) {
        Object.entries(data.settings).forEach(([key, value]) => {
          transaction.objectStore(STORES.SETTINGS).put({ key, value })
        })
      }

      await Promise.all(imports)
      return { success: true, imported: imports.length }
    } catch (error) {
      transaction.abort()
      throw error
    }
  }
}

export default new ExportImportAction()

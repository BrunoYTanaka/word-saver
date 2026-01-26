import { Settings } from '@/features/settings'
import { FullAlert } from '@/features/alerts'
import { FullContext } from '@/features/vocabulary'
import { FullWord } from '@/features/vocabulary'
import { validateImportData } from '../helpers/validate-import-data'
import { database, STORES } from '@/core'

interface Options {
  mode?: 'merge' | 'replace'
  validateData?: boolean
}

interface JsonData {
  words?: FullWord[]
  contexts?: FullContext[]
  alerts?: FullAlert[]
  settings?: Settings
}

type Mode = 'merge' | 'replace'

class ImportAction {
  async importAllData(
    data: JsonData,
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
        await Promise.all([
          transaction.objectStore(STORES.WORDS).clear(),
          transaction.objectStore(STORES.CONTEXTS).clear(),
          transaction.objectStore(STORES.ALERTS).clear(),
          transaction.objectStore(STORES.SETTINGS).clear()
        ])
      }

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

  async importData(jsonData: JsonData | string, options: Options = {}) {
    const { mode = 'merge', validateData = true } = options

    try {
      let data

      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData)
      } else {
        data = jsonData
      }

      if (validateData) {
        const validation = validateImportData(data)
        if (!validation.isValid) {
          throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`)
        }
      }

      const result = await this.importAllData(data, mode)

      return {
        success: true,
        imported: result.imported,
        mode,
        metadata: data.metadata || {}
      }
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error(
        `Falha ao importar dados: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      )
    }
  }

  async importFromFile(
    file: File,
    options: Options = {}
  ): Promise<{
    success: boolean
    imported: number
    mode: string
    metadata: JsonData
  }> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('Nenhum arquivo selecionado'))
        return
      }

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        reject(
          new Error('Formato de arquivo não suportado. Use arquivos JSON.')
        )
        return
      }

      const reader = new FileReader()

      reader.onload = async (event: ProgressEvent<FileReader>) => {
        try {
          const fileContent = event.target?.result
          if (!fileContent || typeof fileContent !== 'string') {
            reject(new Error('Erro ao ler conteúdo do arquivo'))
            return
          }
          const result = await this.importData(fileContent, options)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'))
      }

      reader.readAsText(file)
    })
  }

  // Backup scheduling (for future implementation)
  async scheduleAutoBackup(frequency = 'weekly') {
    // This would integrate with the notification service
    // to schedule automatic backups
    console.log(`Auto backup scheduled: ${frequency}`)
  }
}

export default new ImportAction()

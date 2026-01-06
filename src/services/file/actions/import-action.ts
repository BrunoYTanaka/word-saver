import { Settings } from '../../../types/settings'
import { FullAlert } from '../../../types/alert'
import { FullContext } from '../../../types/context'
import { FullWord } from '../../../types/word'
import { dbService } from '../../db'
import { validateImportData } from '../helpers/validate-import-data'

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

class ImportAction {
  async importData(jsonData: JsonData | string, options: Options = {}) {
    const { mode = 'merge', validateData = true } = options

    try {
      let data

      // Parse JSON if it's a string
      if (typeof jsonData === 'string') {
        data = JSON.parse(jsonData)
      } else {
        data = jsonData
      }

      // Validate data structure
      if (validateData) {
        const validation = validateImportData(data)
        if (!validation.isValid) {
          throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`)
        }
      }

      // Import data to database
      const result = await dbService.import.importData(data, mode)

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

  // Import from file
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

  // Preview import data
  // previewImportData(data: JsonData) {
  //   try {
  //     const preview = {
  //       words: data.words ? data.words.length : 0,
  //       contexts: data.contexts ? data.contexts.length : 0,
  //       alerts: data.alerts ? data.alerts.length : 0,
  //       settings: data.settings ? data.settings.length : 0,
  //       metadata: data.metadata || {},
  //       validation: validateImportData(data)
  //     }

  //     // Sample data preview
  //     if (data.words && data.words.length > 0) {
  //       preview.sampleWords = data.words.slice(0, 3).map((word) => ({
  //         word: word.word,
  //         definition:
  //           word.definition.substring(0, 50) +
  //           (word.definition.length > 50 ? '...' : ''),
  //         contextName: word.contextName || 'N/A'
  //       }))
  //     }

  //     if (data.contexts && data.contexts.length > 0) {
  //       preview.sampleContexts = data.contexts.slice(0, 3).map((ctx) => ({
  //         name: ctx.name,
  //         color: ctx.color || '#3B82F6'
  //       }))
  //     }

  //     return preview
  //   } catch (error) {
  //     console.error('Error previewing import data:', error)
  //     throw new Error('Erro ao visualizar dados de importação')
  //   }
  // }

  // Backup scheduling (for future implementation)
  async scheduleAutoBackup(frequency = 'weekly') {
    // This would integrate with the notification service
    // to schedule automatic backups
    console.log(`Auto backup scheduled: ${frequency}`)
  }
}

export default new ImportAction()

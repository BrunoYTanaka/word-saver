import { Settings } from '../../../types/settings'
import { FullAlert } from '../../../types/alert'
import { FullContext } from '../../../types/context'
import { FullWord } from '../../../types/word'
import { dbService } from '../../db'
import { DB_NAME, DB_VERSION } from '../../db/config/database'
import { countRecords } from '../helpers/count-records'
import { downloadJSON } from '../helpers/download-json'
import { generateFilename } from '../helpers/generate-filename'

interface Metadata {
  appName: string
  exportType: string
  exportedAt: string
  version: number
}

interface ExportAllData {
  metadata: Metadata
  words: FullWord[]
  contexts: FullContext[]
  alerts: FullAlert[]
  settings: Settings
  exportedAt: string
  version: number
}

interface ExportContextData {
  metadata: Metadata
  context: FullContext
  words: FullWord[]
  exportedAt: string
  type: string
}

interface ExportWordsOnly {
  metadata: Metadata & { wordCount: number }
  words: FullWord[]
  contexts: FullContext[]
}

class ExportAction {
  async exportAllData(): Promise<ExportAllData> {
    try {
      const data = await dbService.export.exportData()
      const exportData = {
        ...data,
        metadata: {
          appName: DB_NAME,
          exportType: 'full',
          exportedAt: new Date().toISOString(),
          version: DB_VERSION
        }
      }

      return exportData
    } catch (error) {
      console.error('Error exporting data:', error)
      throw new Error('Falha ao exportar dados')
    }
  }

  async exportContextData(contextId: string): Promise<ExportContextData> {
    try {
      const contextData = await dbService.export.exportContextData(contextId)
      const exportData = {
        ...contextData,
        metadata: {
          appName: DB_NAME,
          exportType: 'context',
          exportedAt: new Date().toISOString(),
          version: DB_VERSION
        }
      }

      return exportData
    } catch (error) {
      console.error('Error exporting context data:', error)
      throw new Error('Falha ao exportar contexto')
    }
  }

  async exportWordsOnly(
    contextIds: string[] | null = null
  ): Promise<ExportWordsOnly> {
    try {
      let words

      if (contextIds && contextIds.length > 0) {
        const wordArrays = await Promise.all(
          contextIds.map((id) => dbService.words.getWordsByContext(id))
        )
        words = wordArrays.flat()
      } else {
        words = await dbService.words.getAll()
      }

      const contexts = await dbService.contexts.getAll()
      const contextMap = contexts.reduce(
        (acc, ctx) => {
          acc[ctx.id] = ctx.name
          return acc
        },
        {} as Record<string, string>
      )

      // Add context names to words for readability
      const enrichedWords = words.map((word) => ({
        ...word,
        contextName: contextMap[word.contextId] || 'Desconhecido'
      }))

      return {
        words: enrichedWords,
        contexts: contextIds
          ? contexts.filter((ctx) => contextIds.includes(ctx.id))
          : contexts,
        metadata: {
          appName: DB_NAME,
          exportType: 'words-only',
          exportedAt: new Date().toISOString(),
          version: DB_VERSION,
          wordCount: words.length
        }
      }
    } catch (error) {
      console.error('Error exporting words:', error)
      throw new Error('Falha ao exportar palavras')
    }
  }

  async quickExportAll() {
    const data = await this.exportAllData()
    const filename = generateFilename('full')
    downloadJSON(data, filename)
    return { filename, recordCount: countRecords(data) }
  }

  async quickExportContext(contextId: string, contextName: string) {
    const data = await this.exportContextData(contextId)
    const filename = generateFilename('context', contextName)
    downloadJSON(data, filename)
    return { filename, recordCount: countRecords(data) }
  }

  async quickExportWords(contextIds: string[] | null = null) {
    const data = await this.exportWordsOnly(contextIds)
    const filename = generateFilename('words-only')
    downloadJSON(data, filename)
    return { filename, recordCount: data.words.length }
  }
}

export default new ExportAction()

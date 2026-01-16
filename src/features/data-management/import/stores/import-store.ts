import { STORES, IndexedDBAdapter, database } from '@/core/database'

class ImportStore extends IndexedDBAdapter {
  private dbReady: Promise<void>

  constructor() {
    super(STORES.SETTINGS) // Usar settings para metadados
    this.dbReady = database.init().then(() => {})
  }

  private async ensureDB(): Promise<void> {
    await this.dbReady
  }

  async importData(data: any, mode: string = 'merge'): Promise<any> {
    await this.ensureDB()
    // Implementar lógica de import
    return {
      success: true,
      imported: {
        words: 0,
        contexts: 0,
        alerts: 0,
        settings: 0
      },
      mode,
      timestamp: new Date().toISOString()
    }
  }
}

export default new ImportStore()

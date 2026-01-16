import database from './core/database'

// Export core database utilities first to avoid circular imports
export { IndexedDBAdapter } from './core/adapter'
export { STORES, DB_VERSION } from './config/database'
export { default as database } from './core/database'

// Store instances with lazy loading to prevent circular dependencies
let storeInstances: any = {}

interface DbService {
  init: () => Promise<IDBDatabase>
  close: () => Promise<void>
  getStore: (storeName: string) => Promise<any>
  words: any
  contexts: any
  alerts: any
  settings: any
  stats: any
  export: any
  import: any
}

async function createStore(storeType: string) {
  if (storeInstances[storeType]) {
    return storeInstances[storeType]
  }

  switch (storeType) {
    case 'alerts': {
      const alertStore = await import('@/features/alerts/stores/alert-store')
      storeInstances.alerts = alertStore.default
      return storeInstances.alerts
    }
    case 'words': {
      const wordStore = await import(
        '@/features/vocabulary/words/stores/word-store'
      )
      storeInstances.words = wordStore.default
      return storeInstances.words
    }
    case 'contexts': {
      const contextStore = await import(
        '@/features/vocabulary/contexts/stores/context-store'
      )
      storeInstances.contexts = contextStore.default
      return storeInstances.contexts
    }
    case 'settings': {
      const settingStore = await import(
        '@/features/settings/stores/setting-store'
      )
      storeInstances.settings = settingStore.default
      return storeInstances.settings
    }
    case 'stats': {
      const statsStore = await import(
        '@/features/analytics/statistics/stores/stats-store'
      )
      storeInstances.stats = statsStore.default
      return storeInstances.stats
    }
    case 'export': {
      const exportStore = await import(
        '@/features/data-management/export/stores/export-store'
      )
      storeInstances.export = exportStore.default
      return storeInstances.export
    }
    case 'import': {
      const importStore = await import(
        '@/features/data-management/import/stores/import-store'
      )
      storeInstances.import = importStore.default
      return storeInstances.import
    }
    default:
      throw new Error(`Unknown store type: ${storeType}`)
  }
}

export const dbService: DbService = {
  init: () => database.getDB(),
  close: () => database.close(),
  getStore: createStore,
  get words() {
    return createStore('words')
  },
  get contexts() {
    return createStore('contexts')
  },
  get alerts() {
    return createStore('alerts')
  },
  get settings() {
    return createStore('settings')
  },
  get stats() {
    return createStore('stats')
  },
  get export() {
    return createStore('export')
  },
  get import() {
    return createStore('import')
  }
}

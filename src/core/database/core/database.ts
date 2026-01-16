import { DB_NAME, DB_VERSION } from '../config/database'
import { schemas } from './schemas'

class Database {
  db: IDBDatabase | null = null
  initPromise: Promise<IDBDatabase> | null = null

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result

        Object.entries(schemas).forEach(([storeName, schema]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store: IDBObjectStore = db.createObjectStore(storeName, {
              keyPath: schema.keyPath
            })

            schema.indexes.forEach((index) => {
              store.createIndex(index.name, index.keyPath, {
                unique: index.unique
              })
            })
          }
        })
      }
    })

    return this.initPromise
  }

  async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Failed to initialize database')
    }
    return this.db
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initPromise = null
    }
  }
}

export default new Database()

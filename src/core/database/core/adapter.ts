import database from './database'

class IndexedDBAdapter {
  private storeName: string

  constructor(storeName: string) {
    this.storeName = storeName
  }

  async add<T>(data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = database.db!.transaction(
        [this.storeName],
        'readwrite'
      )
      const store = transaction.objectStore(this.storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(id: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = database.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll<T>(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = database.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async update<T>(data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = database.db!.transaction(
        [this.storeName],
        'readwrite'
      )
      const store = transaction.objectStore(this.storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(id: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = database.db!.transaction(
        [this.storeName],
        'readwrite'
      )
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = database.db!.transaction(
        [this.storeName],
        'readwrite'
      )
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export { IndexedDBAdapter }

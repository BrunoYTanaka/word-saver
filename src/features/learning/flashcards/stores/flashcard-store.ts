import { STORES, IndexedDBAdapter, database } from '@/core/database'

class FlashcardStore extends IndexedDBAdapter {
  private dbReady: Promise<void>

  constructor() {
    super(STORES.FLASHCARDS || 'flashcards')
    this.dbReady = database.init().then(() => {})
  }

  private async ensureDB(): Promise<void> {
    await this.dbReady
  }

  async getAll<T>(): Promise<T[]> {
    await this.ensureDB()
    return super.getAll<T>()
  }

  async addFlashcard<T>(data: T): Promise<IDBValidKey> {
    await this.ensureDB()
    return this.add({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    })
  }

  async updateFlashcard<T>(data: T): Promise<IDBValidKey> {
    await this.ensureDB()
    return this.update(data)
  }

  async deleteFlashcard(id: string): Promise<void> {
    await this.ensureDB()
    return this.delete(id)
  }
}

export default new FlashcardStore()

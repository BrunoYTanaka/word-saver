import { Context, FullContext } from '../types/context'
import { FullWord } from '../../words/types/word'
import { STORES, IndexedDBAdapter, database } from '@/core/database'
import WordStore from '../../words/stores/word-store'

class ContextStore extends IndexedDBAdapter {
  private dbReady: Promise<void>

  constructor() {
    super(STORES.CONTEXTS)
    this.dbReady = database.init().then(() => {})
  }

  private async ensureDB(): Promise<void> {
    await this.dbReady
  }

  async getAll<T = FullContext>(): Promise<T[]> {
    await this.ensureDB()
    return super.getAll<T>()
  }

  async addContext(context: Context): Promise<IDBValidKey> {
    await this.ensureDB()
    return this.add({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...context
    })
  }

  async getContextWithWordCount(): Promise<
    (FullContext & { wordCount: number })[]
  > {
    await this.ensureDB()
    const contexts = await this.getAll<FullContext>()
    const words = await WordStore.getAll<FullWord>()

    return contexts.map((context) => ({
      ...context,
      wordCount: words.filter((word) => word.contextId === context.id).length
    }))
  }

  async clear(): Promise<void> {
    await this.ensureDB()
    return super.clear()
  }
}

export default new ContextStore()

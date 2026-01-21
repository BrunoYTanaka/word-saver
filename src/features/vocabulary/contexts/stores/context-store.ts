import { Context, FullContext } from '../types/context'
import { FullWord } from '../../words/types/word'
import { STORES, IndexedDBAdapter } from '@/core/database'
import WordStore from '../../words/stores/word-store'

class ContextStore extends IndexedDBAdapter {
  constructor() {
    super(STORES.CONTEXTS)
  }

  async get<T = FullContext>(id: string): Promise<T> {
    return super.get<T>(id)
  }

  async getAll<T = FullContext>(): Promise<T[]> {
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
    const contexts = await this.getAll<FullContext>()
    const words = await WordStore.getAll<FullWord>()

    return contexts.map((context) => ({
      ...context,
      wordCount: words.filter((word) => word.contextId === context.id).length
    }))
  }

  async clear(): Promise<void> {
    return super.clear()
  }
}

export default new ContextStore()

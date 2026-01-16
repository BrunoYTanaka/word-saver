import { Context, FullContext } from '../types/context'
import { FullWord } from '../../words/types/word'
import { STORES } from '../../../../core/database/config/database'
import BaseAction from '../../../../core/database/core/base-action'
import WordService from '../../words/services/word-action'

class ContextAction extends BaseAction {
  constructor() {
    super(STORES.CONTEXTS)
  }

  async getAll<T = FullContext>(): Promise<T[]> {
    return super.getAll<T>()
  }

  async get<T = FullContext>(id: string): Promise<T> {
    return super.get<T>(id)
  }

  async addContext(context: Context): Promise<IDBValidKey> {
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
    const words = await WordService.getAll<FullWord>()

    return contexts.map((context) => ({
      ...context,
      wordCount: words.filter((word) => word.contextId === context.id).length
    }))
  }
}

export default new ContextAction()

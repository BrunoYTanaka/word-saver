import { Context, FullContext } from '../../../types/Context'
import { FullWord } from '../../../types/Word'
import { STORES } from '../config/database'
import BaseAction from '../core/base-action'
import WordService from './word-action'

class ContextAction extends BaseAction {
  constructor() {
    super(STORES.CONTEXTS)
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

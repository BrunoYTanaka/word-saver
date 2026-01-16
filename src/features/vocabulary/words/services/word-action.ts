import { Word, FullWord } from '../types/word'
import { STORES } from '../../../../core/database/config/database'
import BaseAction from '../../../../core/database/core/base-action'
import database from '../../../../core/database/core/database'

class WordAction extends BaseAction {
  constructor() {
    super(STORES.WORDS)
  }

  async getAll<T = FullWord>(): Promise<T[]> {
    return super.getAll<T>()
  }

  async addWord(word: Word): Promise<IDBValidKey> {
    return this.add({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewed: null,
      difficulty: 'medium',
      ...word
    })
  }

  async getWordsByContext(contextId: string): Promise<FullWord[]> {
    return new Promise((resolve, reject) => {
      const transaction = database.db!.transaction([STORES.WORDS], 'readonly')
      const store = transaction.objectStore(STORES.WORDS)
      const index = store.index('contextId')
      const request = index.getAll(contextId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async searchWords(query: string): Promise<FullWord[]> {
    const words = await this.getAll<FullWord>()
    const searchTerm = query.toLowerCase()

    return words.filter(
      (word) =>
        word.word.toLowerCase().includes(searchTerm) ||
        word.definition.toLowerCase().includes(searchTerm) ||
        (word.tags &&
          word.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
    )
  }

  async updateWordReview(wordId: string): Promise<IDBValidKey | undefined> {
    const word = await this.get<FullWord>(wordId)
    if (word) {
      word.reviewCount = (word.reviewCount || 0) + 1
      word.lastReviewed = new Date().toISOString()
      return this.update(word)
    }
  }
}

export default new WordAction()

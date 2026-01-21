import { Word, FullWord } from '../types/word'
import { STORES, IndexedDBAdapter } from '@/core/database'

class WordStore extends IndexedDBAdapter {
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
    const words = await this.getAll<FullWord>()
    return words.filter((word) => word.contextId === contextId)
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

  async clear(): Promise<void> {
    await this.ensureDB()
    return super.clear()
  }
}

export default new WordStore()

import { STORES, IndexedDBAdapter, database } from '@/core/database'

class QuizStore extends IndexedDBAdapter {
  private dbReady: Promise<void>

  constructor() {
    super(STORES.QUIZ || 'quiz')
    this.dbReady = database.init().then(() => {})
  }

  private async ensureDB(): Promise<void> {
    await this.dbReady
  }

  async getAll<T>(): Promise<T[]> {
    await this.ensureDB()
    return super.getAll<T>()
  }

  async addQuiz<T>(data: T): Promise<IDBValidKey> {
    await this.ensureDB()
    return this.add({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    })
  }

  async updateQuiz<T>(data: T): Promise<IDBValidKey> {
    await this.ensureDB()
    return this.update(data)
  }

  async deleteQuiz(id: string): Promise<void> {
    await this.ensureDB()
    return this.delete(id)
  }
}

export default new QuizStore()

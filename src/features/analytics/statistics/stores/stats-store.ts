import { Stats } from '../types/stats'
import AlertStore from '@/features/alerts/stores/alert-store'
import WordStore from '@/features/vocabulary/words/stores/word-store'
import { STORES, IndexedDBAdapter, database } from '@/core/database'

class StatsStore extends IndexedDBAdapter {
  private dbReady: Promise<void>

  constructor() {
    super(STORES.STATS)
    this.dbReady = database.init().then(() => {})
  }

  private async ensureDB(): Promise<void> {
    await this.dbReady
  }

  async getStats(): Promise<Stats> {
    await this.ensureDB()
    const [words, alerts] = await Promise.all([
      WordStore.getAll(),
      AlertStore.getAll()
    ])

    const totalWords = words.length
    const activeAlerts = alerts.filter((alert) => alert.isActive).length
    const reviewedWords = words.filter((word) => word.reviewCount > 0).length
    const totalReviews = words.reduce(
      (sum, word) => sum + (word.reviewCount || 0),
      0
    )

    // Words by difficulty
    const difficultyStats = words.reduce(
      (acc, word) => {
        const difficulty = word.difficulty || 'medium'
        acc[difficulty] = (acc[difficulty] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Recent activity (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentWords = words.filter(
      (word) => new Date(word.createdAt) > weekAgo
    ).length

    const recentReviews = words.filter(
      (word) => word.lastReviewed && new Date(word.lastReviewed) > weekAgo
    ).length

    return {
      totalWords,
      totalContexts: 0, // Placeholder - implementar depois
      activeAlerts,
      reviewedWords,
      totalReviews,
      difficultyStats,
      recentWords,
      recentReviews,
      averageReviewsPerWord:
        totalWords > 0 ? (totalReviews / totalWords).toFixed(1) : 0
    }
  }
}

export default new StatsStore()

import AlertService from './alert-action'
import ContextService from './context-action'
import WordService from './word-action'

interface Stats {
  totalWords: number
  totalContexts: number
  activeAlerts: number
  reviewedWords: number
  totalReviews: number
  difficultyStats: Record<string, number>
  recentWords: number
  recentReviews: number
  averageReviewsPerWord: number | string
}
class StatsAction {
  async getStats(): Promise<Stats> {
    const [words, contexts, alerts] = await Promise.all([
      WordService.getAll(),
      ContextService.getAll(),
      AlertService.getAll()
    ])

    const totalWords = words.length
    const totalContexts = contexts.length
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
      totalContexts,
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

export default new StatsAction()

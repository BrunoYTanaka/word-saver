export interface Stats {
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

export interface ProgressData {
  totalWords: number
  reviewedWords: number
  streakDays: number
  averageScore: number
  weeklyProgress: WeeklyProgress[]
  categoryProgress: CategoryProgress[]
}

export interface WeeklyProgress {
  week: string
  wordsAdded: number
  wordsReviewed: number
  quizzesTaken: number
  averageScore: number
}

export interface CategoryProgress {
  category: string
  totalWords: number
  masteredWords: number
  progressPercentage: number
}

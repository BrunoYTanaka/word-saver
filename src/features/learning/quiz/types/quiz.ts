export interface Quiz {
  id?: string
  title: string
  description?: string
  questions: QuizQuestion[]
  timeLimit?: number
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  createdAt?: string
  updatedAt?: string
}

export interface QuizQuestion {
  id?: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
  points?: number
}

export interface QuizResult {
  id?: string
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  completedAt: string
  answers: QuizAnswer[]
}

export interface QuizAnswer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
  timeSpent: number
}

export interface CreateQuizInput {
  title: string
  description?: string
  questions: Omit<QuizQuestion, 'id'>[]
  timeLimit?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
}

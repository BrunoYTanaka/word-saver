export interface Word {
  word: string
  definition: string
  contextId: string
  tags?: string[]
}

export interface FullWord extends Word {
  id: string
  exampleSentence?: string
  createdAt: string
  reviewCount: number
  lastReviewed: string | null
  difficulty: 'easy' | 'medium' | 'hard'
}

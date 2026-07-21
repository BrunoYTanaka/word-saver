export interface Word {
  word: string
  definition: string
  contextId: string
  tags?: string[]
  status?: 'pending' | 'complete'
  source?: 'manual' | 'crossword-ocr'
}

export interface FullWord extends Word {
  id: string
  exampleSentence?: string
  createdAt: string
  reviewCount: number
  lastReviewed: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  color?: string
  order?: number
}

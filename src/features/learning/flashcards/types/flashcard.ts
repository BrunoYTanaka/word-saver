export interface Flashcard {
  id?: string
  front: string
  back: string
  category?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  reviewCount?: number
  lastReviewed?: string | null
}

export interface CreateFlashcardInput {
  front: string
  back: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

export interface UpdateFlashcardInput extends Partial<CreateFlashcardInput> {
  id: string
}

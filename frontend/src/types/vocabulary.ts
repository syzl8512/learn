export interface Vocabulary {
  id: number
  word: string
  definition: string
  pronunciation?: string
  example?: string
  category?: string
  difficulty: 'easy' | 'medium' | 'hard'
  isMastered: boolean
  reviewCount: number
  lastReviewAt?: string
  createdAt: string
  updatedAt: string
}

export interface VocabularyStatistics {
  total: number
  mastered: number
  learning: number
  new: number
}
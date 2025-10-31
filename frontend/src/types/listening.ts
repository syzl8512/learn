export interface ListeningContent {
  id: number
  title: string
  description: string
  audioUrl: string
  transcript?: string
  duration: number
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ListeningHistory {
  id: number
  contentId: number
  duration: number
  completed: boolean
  listenedAt: string
}
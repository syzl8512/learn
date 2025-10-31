export interface Book {
  id: number
  title: string
  author: string
  description: string
  cover?: string
  category: string
  lexileLevel: number
  totalChapters: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: number
  bookId: number
  title: string
  order: number
  wordCount: number
  createdAt: string
  updatedAt: string
}

export interface ChapterContent {
  id: number
  chapterId: number
  content: string
  audioUrl?: string
  createdAt: string
  updatedAt: string
}

export interface ReadingProgress {
  id: number
  bookId: number
  chapterId: number
  progress: number
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: number
  bookId: number
  chapterId: number
  position: number
  note?: string
  createdAt: string
}
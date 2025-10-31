import api from './api'
import type { Book, Chapter } from '@/types/book'

export const bookService = {
  // 获取书籍列表
  async getBooks(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }) {
    return api.get<{ books: Book[], total: number }>('/books', { params })
  },

  // 获取书籍详情
  async getBook(id: number) {
    return api.get<Book>(`/books/${id}`)
  },

  // 获取书籍章节
  async getChapters(bookId: number) {
    return api.get<Chapter[]>(`/books/${bookId}/chapters`)
  },

  // 获取章节内容
  async getChapterContent(chapterId: number) {
    return api.get(`/chapters/${chapterId}/content`)
  },

  // 更新阅读进度
  async updateProgress(bookId: number, chapterId: number, progress: number) {
    return api.post('/reading-progress', {
      bookId,
      chapterId,
      progress
    })
  },

  // 获取阅读进度
  async getProgress(bookId: number) {
    return api.get(`/reading-progress/${bookId}`)
  },

  // 添加书签
  async addBookmark(bookId: number, chapterId: number, position: number, note?: string) {
    return api.post('/bookmarks', {
      bookId,
      chapterId,
      position,
      note
    })
  },

  // 获取书签列表
  async getBookmarks(bookId?: number) {
    return api.get('/bookmarks', {
      params: { bookId }
    })
  }
}
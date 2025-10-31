import api from './api'
import type { ListeningContent, ListeningHistory } from '@/types/listening'

export const listeningService = {
  // 获取听力内容列表
  async getListeningContents(params?: {
    page?: number
    limit?: number
    category?: string
    difficulty?: string
  }) {
    return api.get<{ contents: ListeningContent[], total: number }>('/listening', { params })
  },

  // 获取听力内容详情
  async getListeningContent(id: number) {
    return api.get<ListeningContent>(`/listening/${id}`)
  },

  // 记录听力历史
  async recordListeningHistory(contentId: number, duration: number, completed: boolean) {
    return api.post('/listening/history', {
      contentId,
      duration,
      completed
    })
  },

  // 获取听力历史
  async getListeningHistory(params?: {
    page?: number
    limit?: number
  }) {
    return api.get<{ history: ListeningHistory[], total: number }>('/listening/history', { params })
  },

  // 获取听力统计
  async getListeningStatistics() {
    return api.get('/listening/statistics')
  }
}
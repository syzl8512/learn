import api from './api'
import type { Vocabulary } from '@/types/vocabulary'

export const vocabularyService = {
  // 获取生词列表
  async getVocabularies(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }) {
    return api.get<{ vocabularies: Vocabulary[], total: number }>('/vocabularies', { params })
  },

  // 添加生词
  async addVocabulary(vocabData: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt'>) {
    return api.post<Vocabulary>('/vocabularies', vocabData)
  },

  // 更新生词
  async updateVocabulary(id: number, vocabData: Partial<Vocabulary>) {
    return api.put<Vocabulary>(`/vocabularies/${id}`, vocabData)
  },

  // 删除生词
  async deleteVocabulary(id: number) {
    return api.delete(`/vocabularies/${id}`)
  },

  // 标记生词为已掌握
  async markAsMastered(id: number) {
    return api.put(`/vocabularies/${id}/master`)
  },

  // 获取生词统计
  async getStatistics() {
    return api.get('/vocabularies/statistics')
  },

  // 批量导入生词
  async importVocabularies(words: string[]) {
    return api.post('/vocabularies/import', { words })
  }
}
import { request } from './api';
import {
  Word,
  DictionaryStats,
  DictionarySearchOptions,
  TranslationRequest,
  TranslationResult,
  VocabularyBatch,
  WordImportResult,
} from '../pages/dictionary/types';

export interface DictionaryResponse {
  words: Word[];
  total: number;
  page: number;
  pageSize: number;
}

export interface WordExample {
  id: string;
  wordId: string;
  orig: string;
  trans: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DictionaryService {
  // 获取词汇列表
  async getWords(options: DictionarySearchOptions): Promise<DictionaryResponse> {
    const params: any = {};

    if (options.keyword) params.keyword = options.keyword;
    if (options.examType) params.examType = options.examType;
    if (options.difficulty) params.difficulty = options.difficulty;
    if (options.sortBy) params.sortBy = options.sortBy;
    if (options.sortOrder) params.sortOrder = options.sortOrder;
    if (options.page) params.page = options.page;
    if (options.pageSize) params.pageSize = options.pageSize;

    const response = await request.get('/dictionary/words', params);
    return response.data.data;
  }

  // 获取词汇详情
  async getWord(id: string): Promise<Word> {
    const response = await request.get(`/dictionary/words/${id}`);
    return response.data.data;
  }

  // 创建词汇
  async createWord(wordData: Partial<Word>): Promise<Word> {
    const response = await request.post('/dictionary/words', wordData);
    return response.data.data;
  }

  // 更新词汇
  async updateWord(id: string, wordData: Partial<Word>): Promise<Word> {
    const response = await request.put(`/dictionary/words/${id}`, wordData);
    return response.data.data;
  }

  // 删除词汇
  async deleteWord(id: string): Promise<void> {
    await request.delete(`/dictionary/words/${id}`);
  }

  // 获取统计数据
  async getStats(): Promise<DictionaryStats> {
    const response = await request.get('/dictionary/stats');
    return response.data.data;
  }

  // 导出词汇
  async exportWords(options: DictionarySearchOptions): Promise<Blob> {
    const params: any = {};

    if (options.keyword) params.keyword = options.keyword;
    if (options.examType) params.examType = options.examType;
    if (options.difficulty) params.difficulty = options.difficulty;
    if (options.sortBy) params.sortBy = options.sortBy;
    if (options.sortOrder) params.sortOrder = options.sortOrder;

    const response = await request.get('/dictionary/export', params, { responseType: 'blob' });
    return response.data;
  }

  // 翻译功能
  async translate(translationRequest: TranslationRequest): Promise<TranslationResult> {
    const response = await request.post('/dictionary/translate', translationRequest);
    return response.data.data;
  }

  // 批量导入词汇
  async batchImportWords(words: any[]): Promise<WordImportResult> {
    const response = await request.post('/dictionary/batch-import', { words });
    return response.data.data;
  }

  // 获取导入批次
  async getBatches(): Promise<VocabularyBatch[]> {
    const response = await request.get('/dictionary/batches');
    return response.data.data;
  }

  // 获取批次详情
  async getBatch(id: string): Promise<VocabularyBatch> {
    const response = await request.get(`/dictionary/batches/${id}`);
    return response.data.data;
  }

  // 删除批次
  async deleteBatch(id: string): Promise<void> {
    await request.delete(`/dictionary/batches/${id}`);
  }

  // 获取词汇例句
  async getWordExamples(wordId: string): Promise<WordExample[]> {
    const response = await request.get(`/dictionary/words/${wordId}/examples`);
    return response.data.data;
  }

  // 创建例句
  async createExample(exampleData: Partial<WordExample>): Promise<WordExample> {
    const response = await request.post('/dictionary/examples', exampleData);
    return response.data.data;
  }

  // 更新例句
  async updateExample(id: string, exampleData: Partial<WordExample>): Promise<WordExample> {
    const response = await request.put(`/dictionary/examples/${id}`, exampleData);
    return response.data.data;
  }

  // 删除例句
  async deleteExample(id: string): Promise<void> {
    await request.delete(`/dictionary/examples/${id}`);
  }

  // 搜索词汇
  async searchVocabulary(keyword: string, limit: number = 10): Promise<Word[]> {
    const response = await request.get('/dictionary/search', { q: keyword, limit });
    return response.data.data;
  }

  // 获取推荐词汇
  async getRecommendedWords(examType: string, count: number = 20): Promise<Word[]> {
    const response = await request.get('/dictionary/recommended', { examType, count });
    return response.data.data;
  }

  // 获取随机词汇
  async getRandomWords(count: number = 10, examType?: string): Promise<Word[]> {
    const params: any = { count };
    if (examType) params.examType = examType;

    const response = await request.get('/dictionary/random', params);
    return response.data.data;
  }

  // 词汇学习统计
  async getWordLearningStats(wordId: string): Promise<{
    viewCount: number;
    favoriteCount: number;
    exampleCount: number;
    lastViewed: Date;
  }> {
    const response = await request.get(`/dictionary/words/${wordId}/stats`);
    return response.data.data;
  }

  // 收藏词汇
  async favoriteWord(wordId: string): Promise<void> {
    await request.post(`/dictionary/words/${wordId}/favorite`);
  }

  // 取消收藏
  async unfavoriteWord(wordId: string): Promise<void> {
    await request.delete(`/dictionary/words/${wordId}/favorite`);
  }

  // 获取收藏列表
  async getFavoriteWords(): Promise<Word[]> {
    const response = await request.get('/dictionary/favorites');
    return response.data.data;
  }

  // 词汇纠错
  async reportWordError(wordId: string, error: {
    type: 'spelling' | 'translation' | 'phonetic' | 'example';
    description: string;
    suggestion?: string;
  }): Promise<void> {
    await request.post(`/dictionary/words/${wordId}/report-error`, error);
  }

  // 批量操作
  async batchUpdateWords(wordIds: string[], updates: Partial<Word>): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await request.put('/dictionary/batch-update', {
      wordIds,
      updates,
    });
    return response.data.data;
  }

  // 批量删除
  async batchDeleteWords(wordIds: string[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const response = await request.delete('/dictionary/batch-delete', {
      data: { wordIds },
    });
    return response.data.data;
  }

  // 导入进度查询
  async getImportProgress(batchId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    processed: number;
    total: number;
    errors: string[];
  }> {
    const response = await request.get(`/dictionary/batches/${batchId}/progress`);
    return response.data.data;
  }

  // 词汇发音验证
  async validatePronunciation(wordId: string): Promise<{
    usPhoneticValid: boolean;
    ukPhoneticValid: boolean;
    suggestions: {
      us?: string;
      uk?: string;
    };
  }> {
    const response = await request.post(`/dictionary/words/${wordId}/validate-pronunciation`);
    return response.data.data;
  }

  // 例句翻译质量检查
  async checkTranslationQuality(exampleId: string): Promise<{
    score: number;
    suggestions: string[];
    issues: string[];
  }> {
    const response = await request.post(`/dictionary/examples/${exampleId}/check-quality`);
    return response.data.data;
  }

  // 同义词推荐
  async getSynonymSuggestions(wordId: string): Promise<{
    synonyms: Array<{
      word: string;
      similarity: number;
      context?: string;
    }>;
  }> {
    const response = await request.get(`/dictionary/words/${wordId}/synonym-suggestions`);
    return response.data.data;
  }

  // 例句推荐
  async getExampleSuggestions(wordId: string): Promise<{
    examples: Array<{
      sentence: string;
      translation: string;
      source: string;
      confidence: number;
    }>;
  }> {
    const response = await request.get(`/dictionary/words/${wordId}/example-suggestions`);
    return response.data.data;
  }
}
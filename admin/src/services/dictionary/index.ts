import { request } from '../api';
import type {
  Vocabulary,
  VocabularyLibrary,
  VocabularySearchParams,
  VocabularyImportParams,
  TranslationOptimizationRequest,
  TranslationOptimizationResponse,
  VocabularyStats
} from '@/types/dictionary';

export const dictionaryService = {
  // 词汇管理
  // 获取词汇列表
  getVocabulary: (params: VocabularySearchParams) => {
    return request.get<{ items: Vocabulary[]; total: number }>('/vocabulary', params);
  },

  // 获取词汇详情
  getWord: (id: string) => {
    return request.get<Vocabulary>(`/vocabulary/${id}`);
  },

  // 创建词汇
  createWord: (data: Partial<Vocabulary>) => {
    return request.post<Vocabulary>('/vocabulary', data);
  },

  // 更新词汇
  updateWord: (id: string, data: Partial<Vocabulary>) => {
    return request.put<Vocabulary>(`/vocabulary/${id}`, data);
  },

  // 删除词汇
  deleteWord: (id: string) => {
    return request.delete(`/vocabulary/${id}`);
  },

  // 批量删除词汇
  batchDeleteWords: (ids: string[]) => {
    return request.post('/vocabulary/batch-delete', { ids });
  },

  // 批量审核词汇
  batchReviewWords: (ids: string[], data: { status: 'active' | 'inactive'; reviewerId: string }) => {
    return request.post('/vocabulary/batch-review', { ids, ...data });
  },

  // 词汇库管理
  // 获取词汇库列表
  getLibraries: () => {
    return request.get<VocabularyLibrary[]>('/vocabulary-libraries');
  },

  // 获取词汇库详情
  getLibrary: (id: string) => {
    return request.get<VocabularyLibrary>(`/vocabulary-libraries/${id}`);
  },

  // 创建词汇库
  createLibrary: (data: Partial<VocabularyLibrary>) => {
    return request.post<VocabularyLibrary>('/vocabulary-libraries', data);
  },

  // 更新词汇库
  updateLibrary: (id: string, data: Partial<VocabularyLibrary>) => {
    return request.put<VocabularyLibrary>(`/vocabulary-libraries/${id}`, data);
  },

  // 删除词汇库
  deleteLibrary: (id: string) => {
    return request.delete(`/vocabulary-libraries/${id}`);
  },

  // 词汇导入
  // 导入词汇文件
  importWords: (params: VocabularyImportParams, onProgress?: (progressEvent: any) => void) => {
    if (params.source === 'excel' || params.source === 'csv' || params.source === 'json') {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('mapping', JSON.stringify(params.mapping));
      formData.append('options', JSON.stringify(params.options));
      formData.append('source', params.source);

      return request.upload('/vocabulary/import', formData, onProgress);
    }
    return Promise.reject(new Error('不支持的文件类型'));
  },

  // 下载导入模板
  downloadImportTemplate: () => {
    return request.download('/vocabulary/import-template', {}, 'vocabulary-import-template.xlsx');
  },

  // 导出词汇
  exportWords: (params: {
    format: 'excel' | 'csv' | 'json';
    filters?: VocabularySearchParams;
    libraryId?: string;
  }) => {
    return request.download('/vocabulary/export', params, `vocabulary-export.${params.format}`);
  },

  // 智能翻译和优化
  // 智能翻译
  translateWord: (word: string, targetLanguage: string = 'zh-CN') => {
    return request.post<{
      word: string;
      translation: string;
      phonetic?: string;
      definition?: string;
      example?: string;
    }>('/vocabulary/translate', { word, targetLanguage });
  },

  // 翻译优化
  optimizeTranslation: (params: TranslationOptimizationRequest) => {
    return request.post<TranslationOptimizationResponse>('/vocabulary/optimize-translation', params);
  },

  // 批量翻译优化
  batchOptimizeTranslation: (words: Array<{
    word: string;
    translation: string;
    context?: string;
  }>, options: {
    targetAudience: 'children' | 'teenagers' | 'adults';
    optimizationType: 'simplify' | 'expand' | 'contextualize';
  }) => {
    return request.post<TranslationOptimizationResponse[]>('/vocabulary/batch-optimize-translation', {
      words,
      options,
    });
  },

  // 智能生成例句
  generateExample: (word: string, context?: string, difficulty?: number) => {
    return request.post<{
      example: string;
      translation: string;
      difficulty: number;
    }>('/vocabulary/generate-example', { word, context, difficulty });
  },

  // 批量生成例句
  batchGenerateExamples: (words: string[], options?: {
    context?: string;
    difficulty?: number;
  }) => {
    return request.post<Array<{
      word: string;
      example: string;
      translation: string;
      difficulty: number;
    }>>('/vocabulary/batch-generate-examples', { words, ...options });
  },

  // 词汇匹配和去重
  // 查找重复词汇
  findDuplicates: (options: {
    checkSimilarity?: boolean;
    similarityThreshold?: number;
    libraryId?: string;
  }) => {
    return request.get<Array<{
      group: string;
      words: Vocabulary[];
      similarity: number;
    }>>('/vocabulary/find-duplicates', options);
  },

  // 合并重复词汇
  mergeDuplicates: (groupId: string, masterWordId: string, options: {
    keepBestTranslation?: boolean;
    mergeExamples?: boolean;
    mergeTags?: boolean;
  }) => {
    return request.post(`/vocabulary/merge-duplicates/${groupId}`, {
      masterWordId,
      ...options,
    });
  },

  // 智能补全词汇信息
  enrichWord: (wordId: string, options: {
    fetchPhonetic?: boolean;
    fetchDefinition?: boolean;
    fetchExample?: boolean;
    fetchSynonyms?: boolean;
    fetchAntonyms?: boolean;
  }) => {
    return request.post<Vocabulary>(`/vocabulary/${wordId}/enrich`, options);
  },

  // 批量智能补全
  batchEnrichWords: (wordIds: string[], options: {
    fetchPhonetic?: boolean;
    fetchDefinition?: boolean;
    fetchExample?: boolean;
    fetchSynonyms?: boolean;
    fetchAntonyms?: boolean;
  }) => {
    return request.post('/vocabulary/batch-enrich', { wordIds, ...options });
  },

  // 统计分析
  // 获取词汇统计
  getStats: (params?: { libraryId?: string; startDate?: string; endDate?: string }) => {
    return request.get<VocabularyStats>('/vocabulary/stats', params);
  },

  // 获取词汇频率分析
  getFrequencyAnalysis: (libraryId?: string) => {
    return request.get<Array<{
      range: string;
      count: number;
      percentage: number;
    }>>('/vocabulary/frequency-analysis', { libraryId });
  },

  // 获取难度分布
  getDifficultyDistribution: (libraryId?: string) => {
    return request.get<Array<{
      difficulty: number;
      count: number;
      percentage: number;
    }>>('/vocabulary/difficulty-distribution', { libraryId });
  },

  // 获取分类分布
  getCategoryDistribution: (libraryId?: string) => {
    return request.get<Array<{
      category: string;
      count: number;
      percentage: number;
    }>>('/vocabulary/category-distribution', { libraryId });
  },

  // 获取最近添加的词汇
  getRecentAdditions: (limit?: number, libraryId?: string) => {
    return request.get<Vocabulary[]>('/vocabulary/recent-additions', { limit, libraryId });
  },

  // 获取热门词汇
  getPopularWords: (limit?: number, libraryId?: string) => {
    return request.get<Vocabulary[]>('/vocabulary/popular', { limit, libraryId });
  },

  // 搜索和筛选
  // 高级搜索
  advancedSearch: (params: {
    keyword?: string;
    definition?: string;
    translation?: string;
    categories?: string[];
    difficulties?: number[];
    tags?: string[];
    frequencyRange?: [number, number];
    hasPhonetic?: boolean;
    hasExample?: boolean;
    libraryId?: string;
    dateRange?: [string, string];
    page?: number;
    pageSize?: number;
  }) => {
    return request.get<{ items: Vocabulary[]; total: number }>('/vocabulary/advanced-search', params);
  },

  // 获取标签列表
  getTags: (libraryId?: string) => {
    return request.get<{ tag: string; count: number }[]>('/vocabulary/tags', { libraryId });
  },

  // 获取分类列表
  getCategories: (libraryId?: string) => {
    return request.get<{ category: string; count: number }[]>('/vocabulary/categories', { libraryId });
  },

  // 词汇建议
  // 根据输入获取词汇建议
  getSuggestions: (query: string, limit?: number) => {
    return request.get<Array<{
      word: string;
      translation: string;
      frequency: number;
    }>>('/vocabulary/suggestions', { query, limit });
  },

  // 获取同义词
  getSynonyms: (word: string) => {
    return request.get<string[]>(`/vocabulary/${word}/synonyms`);
  },

  // 获取反义词
  getAntonyms: (word: string) => {
    return request.get<string[]>(`/vocabulary/${word}/antonyms`);
  },
};

export default dictionaryService;
import { PaginationParams } from './common';

// 词汇类型
export interface Vocabulary {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
  category?: string;
  difficulty: number; // 1-5 难度等级
  frequency: number; // 使用频率
  synonyms?: string[];
  antonyms?: string[];
  tags: string[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// 词汇库类型
export interface VocabularyLibrary {
  id: string;
  name: string;
  description?: string;
  category: string;
  wordCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// 词汇查询参数
export interface VocabularySearchParams extends PaginationParams {
  keyword?: string;
  category?: string;
  difficulty?: number;
  status?: string;
  tags?: string[];
  frequency?: {
    min?: number;
    max?: number;
  };
}

// 词汇导入参数
export interface VocabularyImportParams {
  source: 'excel' | 'csv' | 'json';
  file: File;
  mapping: {
    wordField: string;
    definitionField: string;
    translationField: string;
    phoneticField?: string;
    exampleField?: string;
    exampleTranslationField?: string;
    categoryField?: string;
    difficultyField?: string;
    tagsField?: string;
  };
  options: {
    skipFirstRow?: boolean;
    updateExisting?: boolean;
    defaultCategory?: string;
    defaultDifficulty?: number;
  };
}

// 翻译优化请求
export interface TranslationOptimizationRequest {
  word: string;
  originalTranslation: string;
  context?: string;
  targetAudience: 'children' | 'teenagers' | 'adults';
  optimizationType: 'simplify' | 'expand' | 'contextualize';
}

// 翻译优化响应
export interface TranslationOptimizationResponse {
  originalTranslation: string;
  optimizedTranslation: string;
  suggestions: string[];
  explanation: string;
  confidence: number; // 0-100
}

// 词汇统计
export interface VocabularyStats {
  totalWords: number;
  activeWords: number;
  pendingWords: number;
  categoryDistribution: {
    [category: string]: number;
  };
  difficultyDistribution: {
    [difficulty: string]: number;
  };
  recentAdditions: Vocabulary[];
  popularWords: Vocabulary[];
}
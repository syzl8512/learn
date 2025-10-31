import type { PaginationParams } from '@/types/common';

// 听力材料类型
export interface ListeningMaterial {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: number; // 1-5 难度等级
  audioUrl?: string;
  duration?: number; // 音频时长（秒）
  status: 'draft' | 'published' | 'archived' | 'pending';
  source?: 'manual' | 'feishu' | 'imported';
  sourceUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  reviewerId?: string;
  reviewedAt?: string;
  reviewFeedback?: string;
  reviewRating?: number;
}

// 飞书多维表格数据类型
export interface FeishuRecord {
  recordId: string;
  fields: {
    title?: string;
    content?: string;
    category?: string;
    difficulty?: string;
    audioUrl?: string;
    tags?: string[];
    [key: string]: any;
  };
}

// 听力材料查询参数
export interface ListeningSearchParams extends PaginationParams {
  keyword?: string;
  category?: string;
  difficulty?: number;
  status?: string;
  source?: string;
  tags?: string[];
}

// 听力材料导入参数
export interface ListeningImportParams {
  source: 'feishu' | 'excel' | 'csv';
  config: {
    feishu?: {
      appId: string;
      appSecret: string;
      tableId: string;
      viewId?: string;
    };
    file?: File;
  };
  mapping: {
    titleField: string;
    contentField: string;
    categoryField: string;
    difficultyField: string;
    audioUrlField?: string;
    tagsField?: string;
  };
}

// 听力材料统计
export interface ListeningStats {
  totalMaterials: number;
  publishedMaterials: number;
  draftMaterials: number;
  totalDuration: number; // 总时长（秒）
  categoryDistribution: {
    [category: string]: number;
  };
  difficultyDistribution: {
    [difficulty: string]: number;
  };
}

// 审核记录类型
export interface ReviewRecord {
  id: string;
  materialId: string;
  materialTitle: string;
  reviewerId: string;
  reviewerName: string;
  status: 'approved' | 'rejected' | 'pending';
  rating?: number;
  feedback?: string;
  reviewedAt?: string;
  createdAt: string;
}

// 审核统计类型
export interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  totalReviewed: number;
  avgRating: number;
}

// 音频匹配结果类型
export interface AudioMatchResult {
  materialId: string;
  materialTitle: string;
  matchStatus: 'success' | 'failed' | 'pending';
  audioUrl?: string;
  audioSource?: string;
  confidence?: number;
  errorMessage?: string;
}

// 音频匹配配置类型
export interface MatchingConfig {
  source: 'tts' | 'library' | 'upload' | 'external';
  language: string;
  voice: string;
  speed: number;
  quality: 'low' | 'medium' | 'high';
}
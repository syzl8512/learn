import { PaginationParams } from './common';

// 书籍类型
export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  category: string;
  difficulty: number; // 1-5 难度等级
  lexileLevel?: number; // 蓝斯值
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  wordCount?: number;
  estimatedReadingTime?: number; // 预计阅读时间（分钟）
}

// 章节类型
export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content?: string;
  order: number;
  wordCount?: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// 章节版本类型
export interface ChapterVersion {
  id: string;
  chapterId: string;
  version: string;
  content: string;
  difficulty: number;
  lexileLevel?: number;
  wordCount: number;
  status: 'draft' | 'published';
  createdAt: string;
  createdBy: string;
}

// 分册类型
export interface Volume {
  id: string;
  bookId: string;
  title: string;
  description?: string;
  order: number;
  chapterIds: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// 分段类型
export interface Segment {
  id: string;
  chapterId: string;
  content: string;
  order: number;
  wordCount: number;
  difficulty: number;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 书籍查询参数
export interface BookSearchParams extends PaginationParams {
  keyword?: string;
  category?: string;
  difficulty?: number;
  status?: string;
  author?: string;
}

// 章节查询参数
export interface ChapterSearchParams extends PaginationParams {
  bookId?: string;
  keyword?: string;
  status?: string;
}

// PDF上传响应
export interface PdfUploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  extractedText?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}
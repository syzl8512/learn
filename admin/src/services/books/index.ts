import { request } from '../api';
import { Book, Chapter, ChapterVersion, Volume, Segment, BookSearchParams, ChapterSearchParams, PdfUploadResponse } from '../../types/books';

export const bookService = {
  // 书籍管理
  // 获取书籍列表
  getBooks: (params: BookSearchParams) => {
    return request.get<{ items: Book[]; total: number }>('/books', params);
  },

  // 获取书籍详情
  getBook: (id: string) => {
    return request.get<Book>(`/books/${id}`);
  },

  // 创建书籍
  createBook: (data: Partial<Book>) => {
    return request.post<Book>('/books', data);
  },

  // 更新书籍
  updateBook: (id: string, data: Partial<Book>) => {
    return request.put<Book>(`/books/${id}`, data);
  },

  // 删除书籍
  deleteBook: (id: string) => {
    return request.delete(`/books/${id}`);
  },

  // 上传PDF
  uploadPdf: (file: File, onProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.upload<PdfUploadResponse>('/books/upload-pdf', formData, onProgress);
  },

  // 章节管理
  // 获取章节列表
  getChapters: (params: ChapterSearchParams) => {
    return request.get<{ items: Chapter[]; total: number }>('/chapters', params);
  },

  // 获取章节详情
  getChapter: (id: string) => {
    return request.get<Chapter>(`/chapters/${id}`);
  },

  // 创建章节
  createChapter: (data: Partial<Chapter>) => {
    return request.post<Chapter>('/chapters', data);
  },

  // 更新章节
  updateChapter: (id: string, data: Partial<Chapter>) => {
    return request.put<Chapter>(`/chapters/${id}`, data);
  },

  // 删除章节
  deleteChapter: (id: string) => {
    return request.delete(`/chapters/${id}`);
  },

  // 章节版本管理
  // 获取章节版本列表
  getChapterVersions: (chapterId: string) => {
    return request.get<ChapterVersion[]>(`/chapters/${chapterId}/versions`);
  },

  // 创建章节版本
  createChapterVersion: (chapterId: string, data: Partial<ChapterVersion>) => {
    return request.post<ChapterVersion>(`/chapters/${chapterId}/versions`, data);
  },

  // 发布章节版本
  publishChapterVersion: (versionId: string) => {
    return request.post(`/chapter-versions/${versionId}/publish`);
  },

  // 删除章节版本
  deleteChapterVersion: (versionId: string) => {
    return request.delete(`/chapter-versions/${versionId}`);
  },

  // 分册管理
  // 获取分册列表
  getVolumes: (bookId: string) => {
    return request.get<Volume[]>(`/books/${bookId}/volumes`);
  },

  // 创建分册
  createVolume: (data: Partial<Volume>) => {
    return request.post<Volume>('/volumes', data);
  },

  // 更新分册
  updateVolume: (id: string, data: Partial<Volume>) => {
    return request.put<Volume>(`/volumes/${id}`, data);
  },

  // 删除分册
  deleteVolume: (id: string) => {
    return request.delete(`/volumes/${id}`);
  },

  // 分段管理
  // 获取分段列表
  getSegments: (chapterId: string) => {
    return request.get<Segment[]>(`/chapters/${chapterId}/segments`);
  },

  // 创建分段
  createSegment: (chapterId: string, data: Partial<Segment>) => {
    return request.post<Segment>(`/chapters/${chapterId}/segments`, data);
  },

  // 更新分段
  updateSegment: (id: string, data: Partial<Segment>) => {
    return request.put<Segment>(`/segments/${id}`, data);
  },

  // 删除分段
  deleteSegment: (id: string) => {
    return request.delete(`/segments/${id}`);
  },

  // 批量操作
  // 批量生成章节版本
  batchGenerateVersions: (bookId: string, options: { difficulty: number; targetLexile?: number }) => {
    return request.post(`/books/${bookId}/generate-versions`, options);
  },

  // 批量发布章节
  batchPublishChapters: (bookId: string, chapterIds: string[]) => {
    return request.post(`/books/${bookId}/publish-chapters`, { chapterIds });
  },

  // 内容处理
  // 自动分割章节
  autoSplitChapters: (bookId: string, options: { maxWordsPerChapter: number; strategy: string }) => {
    return request.post(`/books/${bookId}/split-chapters`, options);
  },

  // 自动生成分段
  autoGenerateSegments: (chapterId: string, options: { maxWordsPerSegment: number }) => {
    return request.post(`/chapters/${chapterId}/generate-segments`, options);
  },

  // 匹配语音资料
  matchAudio: (chapterId: string, options: { source: string; quality: string }) => {
    return request.post(`/chapters/${chapterId}/match-audio`, options);
  },

  // 难度转写
  rewriteDifficulty: (contentId: string, targetDifficulty: number) => {
    return request.post(`/content/${contentId}/rewrite`, { targetDifficulty });
  },
};

export default bookService;
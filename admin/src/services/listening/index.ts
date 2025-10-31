import { request } from '../api';
import {
  ListeningMaterial,
  FeishuRecord,
  ListeningSearchParams,
  ListeningImportParams,
  ListeningStats
} from '../../types/listening';

export const listeningService = {
  // 听力材料管理
  // 获取听力材料列表
  getMaterials: (params: ListeningSearchParams) => {
    return request.get<{ items: ListeningMaterial[]; total: number }>('/listening-materials', params);
  },

  // 获取听力材料详情
  getMaterial: (id: string) => {
    return request.get<ListeningMaterial>(`/listening-materials/${id}`);
  },

  // 创建听力材料
  createMaterial: (data: Partial<ListeningMaterial>) => {
    return request.post<ListeningMaterial>('/listening-materials', data);
  },

  // 更新听力材料
  updateMaterial: (id: string, data: Partial<ListeningMaterial>) => {
    return request.put<ListeningMaterial>(`/listening-materials/${id}`, data);
  },

  // 删除听力材料
  deleteMaterial: (id: string) => {
    return request.delete(`/listening-materials/${id}`);
  },

  // 批量删除听力材料
  batchDeleteMaterials: (ids: string[]) => {
    return request.post('/listening-materials/batch-delete', { ids });
  },

  // 发布听力材料
  publishMaterial: (id: string) => {
    return request.post(`/listening-materials/${id}/publish`);
  },

  // 批量发布听力材料
  batchPublishMaterials: (ids: string[]) => {
    return request.post('/listening-materials/batch-publish', { ids });
  },

  // 飞书多维表格集成
  // 连接飞书应用
  connectFeishu: (config: { appId: string; appSecret: string }) => {
    return request.post('/feishu/connect', config);
  },

  // 获取飞书多维表格数据
  getFeishuRecords: (tableId: string, viewId?: string) => {
    return request.get<FeishuRecord[]>('/feishu/records', { tableId, viewId });
  },

  // 从飞书导入听力材料
  importFromFeishu: (tableId: string, mapping: any, options?: any) => {
    return request.post('/listening-materials/import-from-feishu', {
      tableId,
      mapping,
      options,
    });
  },

  // 文件导入
  // 导入Excel/CSV文件
  importFromFile: (params: ListeningImportParams) => {
    if (params.source === 'excel' || params.source === 'csv') {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('mapping', JSON.stringify(params.mapping));
      formData.append('options', JSON.stringify(params.options));

      return request.upload('/listening-materials/import-from-file', formData);
    }
    return Promise.reject(new Error('不支持的文件类型'));
  },

  // 下载导入模板
  downloadImportTemplate: () => {
    return request.download('/listening-materials/import-template', {}, 'listening-import-template.xlsx');
  },

  // 音频管理
  // 上传音频文件
  uploadAudio: (file: File, onProgress?: (progressEvent: any) => void) => {
    const formData = new FormData();
    formData.append('audio', file);
    return request.upload<{ url: string; duration: number }>('/listening-materials/upload-audio', formData, onProgress);
  },

  // 匹配音频
  matchAudio: (materialId: string, options: { source: string; language: string }) => {
    return request.post(`/listening-materials/${materialId}/match-audio`, options);
  },

  // 批量匹配音频
  batchMatchAudio: (materialIds: string[], options: { source: string; language: string }) => {
    return request.post('/listening-materials/batch-match-audio', {
      materialIds,
      options,
    });
  },

  // 内容处理
  // 自动获取小短文
  fetchShortArticles: (options: {
    category: string;
    difficulty: number;
    count: number;
    source: string
  }) => {
    return request.post('/listening-materials/fetch-articles', options);
  },

  // 智能分类
  autoCategorize: (materialId: string) => {
    return request.post(`/listening-materials/${materialId}/auto-categorize`);
  },

  // 批量智能分类
  batchAutoCategorize: (materialIds: string[]) => {
    return request.post('/listening-materials/batch-auto-categorize', { materialIds });
  },

  // 难度评估
  assessDifficulty: (materialId: string) => {
    return request.post(`/listening-materials/${materialId}/assess-difficulty`);
  },

  // 内容审核
  reviewMaterial: (materialId: string, data: {
    status: 'approved' | 'rejected';
    feedback?: string;
    reviewerId: string
  }) => {
    return request.post(`/listening-materials/${materialId}/review`, data);
  },

  // 批量审核
  batchReview: (materialIds: string[], data: {
    status: 'approved' | 'rejected';
    feedback?: string;
    reviewerId: string
  }) => {
    return request.post('/listening-materials/batch-review', {
      materialIds,
      ...data,
    });
  },

  // 统计分析
  // 获取听力材料统计
  getStats: (params?: { startDate?: string; endDate?: string }) => {
    return request.get<ListeningStats>('/listening-materials/stats', params);
  },

  // 获取分类分布
  getCategoryDistribution: () => {
    return request.get<{ category: string; count: number }[]>('/listening-materials/category-distribution');
  },

  // 获取难度分布
  getDifficultyDistribution: () => {
    return request.get<{ difficulty: number; count: number }[]>('/listening-materials/difficulty-distribution');
  },

  // 获取热门材料
  getPopularMaterials: (limit?: number) => {
    return request.get<ListeningMaterial[]>('/listening-materials/popular', { limit });
  },

  // 搜索和筛选
  // 高级搜索
  advancedSearch: (params: {
    keyword?: string;
    categories?: string[];
    difficulties?: number[];
    sources?: string[];
    tags?: string[];
    durationRange?: [number, number];
    dateRange?: [string, string];
    page?: number;
    pageSize?: number;
  }) => {
    return request.get<{ items: ListeningMaterial[]; total: number }>('/listening-materials/advanced-search', params);
  },

  // 获取标签列表
  getTags: () => {
    return request.get<{ tag: string; count: number }[]>('/listening-materials/tags');
  },

  // 获取分类列表
  getCategories: () => {
    return request.get<{ category: string; count: number }[]>('/listening-materials/categories');
  },
};

export default listeningService;
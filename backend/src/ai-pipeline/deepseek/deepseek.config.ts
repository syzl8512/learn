/**
 * DeepSeek AI 配置
 */
export interface DeepSeekConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

/**
 * 从环境变量获取 DeepSeek 配置
 */
export function getDeepSeekConfig(): DeepSeekConfig {
  return {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE || '0.7'),
  };
}

/**
 * 蓝斯值等级定义
 */
export const LEXILE_LEVELS = {
  BEGINNER: {
    name: '初级',
    minLexile: 0,
    maxLexile: 400,
    description: '适合英语初学者,基础词汇和简单句型',
  },
  KET: {
    name: 'KET',
    minLexile: 400,
    maxLexile: 700,
    description: '剑桥KET水平,日常交流词汇',
  },
  PET: {
    name: 'PET',
    minLexile: 700,
    maxLexile: 1000,
    description: '剑桥PET水平,中级词汇和复杂句型',
  },
  CUSTOM: {
    name: '自定义',
    minLexile: 1000,
    maxLexile: 1700,
    description: '高级水平,可自定义蓝斯值范围',
  },
};

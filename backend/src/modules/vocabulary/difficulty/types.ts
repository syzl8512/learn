/**
 * 词汇难度等级
 */
export enum VocabularyDifficulty {
  EASY = 'easy', // 简单 (200-400L)
  INTERMEDIATE = 'intermediate', // 中等 (401-800L)
  ADVANCED = 'advanced', // 困难 (801-1200L)
  EXPERT = 'expert', // 专家 (1201-1700L)
}

/**
 * 词汇难度信息
 */
export interface WordDifficultyInfo {
  word: string;
  difficulty: VocabularyDifficulty;
  lexileLevel: number;
  frequency: number; // 词频 (0-1)
  isCommon: boolean; // 是否为常用词
  category: string; // 词汇分类
}

/**
 * 智能高亮配置
 */
export interface HighlightConfig {
  userLexile: number;
  highlightMode: 'all' | 'difficult' | 'unknown' | 'custom';
  customThreshold?: number; // 自定义阈值
  showTooltips?: boolean;
  highlightColors: {
    easy: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
}

/**
 * 高亮结果
 */
export interface HighlightResult {
  word: string;
  difficulty: VocabularyDifficulty;
  shouldHighlight: boolean;
  highlightColor: string;
  tooltip: string;
  lexileLevel: number;
}

import { Injectable } from '@nestjs/common';
import { HighlightConfig, WordDifficultyInfo, VocabularyDifficulty } from './types';

/**
 * 词汇高亮引擎服务
 * 负责判断是否需要高亮单词以及生成提示信息
 */
@Injectable()
export class HighlightEngineService {
  /**
   * 判断是否需要高亮单词
   */
  shouldHighlightWord(wordInfo: WordDifficultyInfo, config: HighlightConfig): boolean {
    switch (config.highlightMode) {
      case 'all':
        return true;

      case 'difficult':
        return wordInfo.lexileLevel > config.userLexile + 100;

      case 'unknown':
        return wordInfo.lexileLevel > config.userLexile + 200;

      case 'custom':
        return wordInfo.lexileLevel > (config.customThreshold || config.userLexile + 150);

      default:
        return false;
    }
  }

  /**
   * 生成工具提示
   */
  generateTooltip(wordInfo: WordDifficultyInfo, config: HighlightConfig): string {
    const difficultyLabels = {
      [VocabularyDifficulty.EASY]: '简单',
      [VocabularyDifficulty.INTERMEDIATE]: '中等',
      [VocabularyDifficulty.ADVANCED]: '困难',
      [VocabularyDifficulty.EXPERT]: '专家',
    };

    const levelDiff = wordInfo.lexileLevel - config.userLexile;
    let levelText = '';

    if (levelDiff > 200) {
      levelText = '超出您的水平';
    } else if (levelDiff > 100) {
      levelText = '略高于您的水平';
    } else if (levelDiff > -100) {
      levelText = '适合您的水平';
    } else {
      levelText = '低于您的水平';
    }

    return `${difficultyLabels[wordInfo.difficulty]} (${wordInfo.lexileLevel}L) - ${levelText}`;
  }

  /**
   * 获取高亮颜色
   */
  getHighlightColor(
    wordInfo: WordDifficultyInfo,
    config: HighlightConfig,
    shouldHighlight: boolean,
  ): string {
    if (!shouldHighlight) {
      return '';
    }
    return config.highlightColors[wordInfo.difficulty];
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { DifficultyAnalyzerService } from './difficulty/difficulty-analyzer.service';
import { HighlightEngineService } from './difficulty/highlight-engine.service';
import { WordCacheService } from './difficulty/word-cache.service';
import {
  VocabularyDifficulty,
  WordDifficultyInfo,
  HighlightConfig,
  HighlightResult,
} from './difficulty/types';

// 导出类型，保持向后兼容
export { VocabularyDifficulty, WordDifficultyInfo, HighlightConfig, HighlightResult };

/**
 * 词汇难度服务（主协调器）
 * 整合难度分析、高亮引擎和缓存管理三个子服务
 */
@Injectable()
export class VocabularyDifficultyService {
  private readonly logger = new Logger(VocabularyDifficultyService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private difficultyAnalyzer: DifficultyAnalyzerService,
    private highlightEngine: HighlightEngineService,
    private wordCache: WordCacheService,
  ) {}

  /**
   * 分析文本中的词汇难度
   */
  async analyzeTextDifficulty(text: string, config: HighlightConfig): Promise<HighlightResult[]> {
    this.logger.log(`分析文本词汇难度，用户Lexile: ${config.userLexile}L`);

    // 提取单词
    const words = this.difficultyAnalyzer.extractWords(text);
    const results: HighlightResult[] = [];

    // 并行处理单词分析
    const wordPromises = words.map((word) => this.analyzeWordDifficulty(word, config));
    const wordResults = await Promise.all(wordPromises);

    // 合并结果
    for (let i = 0; i < words.length; i++) {
      results.push({
        word: words[i],
        ...wordResults[i],
      });
    }

    this.logger.log(`词汇分析完成，共分析 ${words.length} 个单词`);
    return results;
  }

  /**
   * 分析单个单词的难度
   */
  private async analyzeWordDifficulty(
    word: string,
    config: HighlightConfig,
  ): Promise<Omit<HighlightResult, 'word'>> {
    const cleanWord = word.toLowerCase().trim();

    // 检查缓存
    let wordInfo = this.wordCache.get(cleanWord);

    if (!wordInfo) {
      // 分析单词难度
      wordInfo = await this.difficultyAnalyzer.getWordDifficultyInfo(cleanWord);
      this.wordCache.set(cleanWord, wordInfo);
    }

    // 判断是否需要高亮
    const shouldHighlight = this.highlightEngine.shouldHighlightWord(wordInfo, config);

    return {
      difficulty: wordInfo.difficulty,
      shouldHighlight,
      highlightColor: this.highlightEngine.getHighlightColor(wordInfo, config, shouldHighlight),
      tooltip: this.highlightEngine.generateTooltip(wordInfo, config),
      lexileLevel: wordInfo.lexileLevel,
    };
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.wordCache.clearCache();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    return this.wordCache.getCacheStats();
  }
}

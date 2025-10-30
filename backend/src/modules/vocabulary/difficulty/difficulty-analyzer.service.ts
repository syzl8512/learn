import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { WordDifficultyInfo, VocabularyDifficulty } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 词汇难度分析服务
 * 负责分析单词难度，包括从数据库查询、AI分析等
 */
@Injectable()
export class DifficultyAnalyzerService {
  private readonly logger = new Logger(DifficultyAnalyzerService.name);
  private readonly commonWords: Set<string>;

  constructor(private prisma: PrismaService) {
    // 加载常用词列表
    const commonWordsPath = path.join(__dirname, '../data/common-words.json');
    const commonWordsData = JSON.parse(fs.readFileSync(commonWordsPath, 'utf-8'));
    this.commonWords = new Set(commonWordsData);
    this.logger.log(`加载了 ${this.commonWords.size} 个常用词`);
  }

  /**
   * 获取单词难度信息
   */
  async getWordDifficultyInfo(word: string): Promise<WordDifficultyInfo> {
    // 检查是否为常用词
    const isCommon = this.commonWords.has(word.toLowerCase());

    if (isCommon) {
      return {
        word,
        difficulty: VocabularyDifficulty.EASY,
        lexileLevel: 300,
        frequency: 0.9,
        isCommon: true,
        category: 'common',
      };
    }

    // 尝试从数据库获取
    try {
      const dbWord = await this.prisma.vocabularyDifficulty.findUnique({
        where: { word: word.toLowerCase() },
      });

      if (dbWord) {
        return {
          word,
          difficulty: dbWord.difficulty as VocabularyDifficulty,
          lexileLevel: dbWord.lexileLevel,
          frequency: dbWord.frequency,
          isCommon: dbWord.isCommon,
          category: dbWord.category,
        };
      }
    } catch (error) {
      this.logger.warn(`数据库查询失败: ${error.message}`);
    }

    // 使用AI分析单词难度
    return await this.analyzeWordWithAI(word);
  }

  /**
   * 使用AI分析单词难度
   */
  private async analyzeWordWithAI(word: string): Promise<WordDifficultyInfo> {
    try {
      // 这里可以调用AI服务分析单词难度
      // 暂时使用简单的规则
      const wordLength = word.length;
      const hasComplexPatterns = this.hasComplexPatterns(word);

      let difficulty: VocabularyDifficulty;
      let lexileLevel: number;

      if (wordLength <= 4 && !hasComplexPatterns) {
        difficulty = VocabularyDifficulty.EASY;
        lexileLevel = 300;
      } else if (wordLength <= 6 && !hasComplexPatterns) {
        difficulty = VocabularyDifficulty.INTERMEDIATE;
        lexileLevel = 600;
      } else if (wordLength <= 8) {
        difficulty = VocabularyDifficulty.ADVANCED;
        lexileLevel = 1000;
      } else {
        difficulty = VocabularyDifficulty.EXPERT;
        lexileLevel = 1400;
      }

      const wordInfo: WordDifficultyInfo = {
        word,
        difficulty,
        lexileLevel,
        frequency: 0.5,
        isCommon: false,
        category: 'analyzed',
      };

      // 异步保存到数据库
      this.saveWordDifficulty(wordInfo).catch((error) => {
        this.logger.warn(`保存单词难度失败: ${error.message}`);
      });

      return wordInfo;
    } catch (error) {
      this.logger.error(`AI分析单词难度失败: ${error.message}`);

      // 降级处理
      return {
        word,
        difficulty: VocabularyDifficulty.INTERMEDIATE,
        lexileLevel: 600,
        frequency: 0.5,
        isCommon: false,
        category: 'fallback',
      };
    }
  }

  /**
   * 检查单词是否有复杂模式
   */
  private hasComplexPatterns(word: string): boolean {
    const complexPatterns = [
      /tion$/,
      /sion$/,
      /ness$/,
      /ment$/,
      /able$/,
      /ible$/,
      /ful$/,
      /less$/,
      /ing$/,
      /ed$/,
      /er$/,
      /est$/,
      /ly$/,
      /ty$/,
      /cy$/,
      /ry$/,
      /ph/,
      /ch/,
      /sh/,
      /th/,
      /gh/,
      /qu/,
      /ck/,
      /ng/,
    ];

    return complexPatterns.some((pattern) => pattern.test(word));
  }

  /**
   * 保存单词难度信息到数据库
   */
  private async saveWordDifficulty(wordInfo: WordDifficultyInfo): Promise<void> {
    try {
      await this.prisma.vocabularyDifficulty.upsert({
        where: { word: wordInfo.word.toLowerCase() },
        update: {
          difficulty: wordInfo.difficulty,
          lexileLevel: wordInfo.lexileLevel,
          frequency: wordInfo.frequency,
          isCommon: wordInfo.isCommon,
          category: wordInfo.category,
          updatedAt: new Date(),
        },
        create: {
          word: wordInfo.word.toLowerCase(),
          difficulty: wordInfo.difficulty,
          lexileLevel: wordInfo.lexileLevel,
          frequency: wordInfo.frequency,
          isCommon: wordInfo.isCommon,
          category: wordInfo.category,
        },
      });
    } catch (error) {
      this.logger.error(`保存单词难度失败: ${error.message}`);
    }
  }

  /**
   * 提取文本中的单词
   */
  extractWords(text: string): string[] {
    // 使用正则表达式提取单词，保留标点符号
    return text.match(/\b[a-zA-Z]+\b/g) || [];
  }
}

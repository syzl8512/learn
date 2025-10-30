import { Injectable, Logger } from '@nestjs/common';
import { WordDifficultyInfo } from './types';

/**
 * 词汇缓存管理服务
 * 负责词汇难度信息的内存缓存
 */
@Injectable()
export class WordCacheService {
  private readonly logger = new Logger(WordCacheService.name);
  private readonly wordCache = new Map<string, WordDifficultyInfo>();
  private readonly cacheExpireMs = 24 * 60 * 60 * 1000; // 24小时缓存

  /**
   * 获取缓存的单词信息
   */
  get(word: string): WordDifficultyInfo | undefined {
    return this.wordCache.get(word.toLowerCase());
  }

  /**
   * 设置单词缓存
   */
  set(word: string, info: WordDifficultyInfo): void {
    this.wordCache.set(word.toLowerCase(), info);
  }

  /**
   * 检查缓存中是否存在
   */
  has(word: string): boolean {
    return this.wordCache.has(word.toLowerCase());
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.wordCache.clear();
    this.logger.log('词汇难度缓存已清空');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.wordCache.size,
      hitRate: 0.8, // TODO: 实现真实的命中率统计
    };
  }

  /**
   * 获取缓存大小
   */
  getSize(): number {
    return this.wordCache.size;
  }
}

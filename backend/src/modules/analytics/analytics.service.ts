import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReadingStatsService } from './services/reading-stats.service';
import { VocabularyStatsService } from './services/vocabulary-stats.service';
import { ReadingProgressService } from './services/reading-progress.service';
import { InsightsService } from './services/insights.service';

// Re-export interfaces for backward compatibility
export { ReadingStats } from './services/reading-stats.service';
export { ReadingProgress } from './services/reading-progress.service';
export { VocabularyStats } from './services/vocabulary-stats.service';
export { LearningInsights, WeeklyReport, MonthlyReport } from './services/insights.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readingStatsService: ReadingStatsService,
    private vocabularyStatsService: VocabularyStatsService,
    private readingProgressService: ReadingProgressService,
    private insightsService: InsightsService,
    private configService: ConfigService,
  ) {}

  /**
   * 获取用户阅读统计
   */
  async getUserReadingStats(userId: string) {
    return this.readingStatsService.getUserReadingStats(userId);
  }

  /**
   * 获取用户阅读进度数据
   */
  async getUserReadingProgress(userId: string, days: number = 30) {
    return this.readingProgressService.getUserReadingProgress(userId, days);
  }

  /**
   * 获取用户词汇统计
   */
  async getUserVocabularyStats(userId: string) {
    return this.vocabularyStatsService.getUserVocabularyStats(userId);
  }

  /**
   * 生成学习洞察
   */
  async generateLearningInsights(userId: string) {
    return this.insightsService.generateLearningInsights(userId);
  }

  /**
   * 生成周报告
   */
  async generateWeeklyReport(userId: string) {
    return this.insightsService.generateWeeklyReport(userId);
  }

  /**
   * 生成月报告
   */
  async generateMonthlyReport(userId: string) {
    return this.insightsService.generateMonthlyReport(userId);
  }
}

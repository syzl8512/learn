import { Injectable } from '@nestjs/common';
import { VocabularyStatsService } from './services/vocabulary-stats.service';
import { ReadingStatsService } from './services/reading-stats.service';
import { BookmarkStatsService } from './services/bookmark-stats.service';
import { HeatmapStatsService } from './services/heatmap-stats.service';
import { DashboardStats } from './interfaces';

/**
 * 统计服务
 * 提供用户学习统计、热力图数据、学习时长等功能
 */
@Injectable()
export class StatsService {
  constructor(
    private readonly vocabularyStatsService: VocabularyStatsService,
    private readonly readingStatsService: ReadingStatsService,
    private readonly bookmarkStatsService: BookmarkStatsService,
    private readonly heatmapStatsService: HeatmapStatsService,
  ) {}

  /**
   * 获取用户学习仪表板统计
   */
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

    const [
      vocabularyStats,
      readingStats,
      bookmarkStats,
      recentVocabulary,
      recentReading,
      heatmapData,
    ] = await Promise.all([
      // 词汇统计
      this.vocabularyStatsService.getVocabularyStats(userId),

      // 阅读统计
      this.readingStatsService.getReadingStats(userId),

      // 书签统计
      this.bookmarkStatsService.getBookmarkStats(userId),

      // 最近7天新增词汇
      this.vocabularyStatsService.getRecentVocabulary(userId, sevenDaysAgo),

      // 最近7天阅读记录
      this.readingStatsService.getRecentReading(userId, sevenDaysAgo),

      // 热力图数据（最近30天）
      this.heatmapStatsService.getHeatmapData(userId, thirtyDaysAgo),
    ]);

    return {
      vocabulary: vocabularyStats,
      reading: readingStats,
      bookmarks: bookmarkStats,
      recentVocabulary,
      recentReading,
      heatmap: heatmapData,
      lastUpdated: now.toISOString(),
    };
  }

  /**
   * 获取词汇统计（委托给子服务）
   */
  private async getVocabularyStats(userId: string) {
    return this.vocabularyStatsService.getVocabularyStats(userId);
  }

  /**
   * 获取阅读统计（委托给子服务）
   */
  private async getReadingStats(userId: string) {
    return this.readingStatsService.getReadingStats(userId);
  }

  /**
   * 获取书签统计（委托给子服务）
   */
  private async getBookmarkStats(userId: string) {
    return this.bookmarkStatsService.getBookmarkStats(userId);
  }

  /**
   * 获取最近词汇（委托给子服务）
   */
  private async getRecentVocabulary(userId: string, since: Date) {
    return this.vocabularyStatsService.getRecentVocabulary(userId, since);
  }

  /**
   * 获取最近阅读（委托给子服务）
   */
  private async getRecentReading(userId: string, since: Date) {
    return this.readingStatsService.getRecentReading(userId, since);
  }

  /**
   * 获取热力图数据（委托给子服务）
   */
  private async getHeatmapData(userId: string, since: Date) {
    return this.heatmapStatsService.getHeatmapData(userId, since);
  }

  /**
   * 获取活动总结
   */
  async getActivitySummary(userId: string, days: number = 30) {
    return this.heatmapStatsService.getActivitySummary(userId, days);
  }

  /**
   * 获取词汇趋势
   */
  async getVocabularyTrend(userId: string, days: number = 30) {
    return this.vocabularyStatsService.getVocabularyTrend(userId, days);
  }

  /**
   * 获取阅读趋势
   */
  async getReadingTrend(userId: string, days: number = 30) {
    return this.readingStatsService.getReadingTrend(userId, days);
  }

  /**
   * 获取书签趋势
   */
  async getBookmarkTrend(userId: string, days: number = 30) {
    return this.bookmarkStatsService.getBookmarkTrend(userId, days);
  }

  /**
   * 获取热门书签
   */
  async getPopularBookmarks(userId: string, limit: number = 10) {
    return this.bookmarkStatsService.getPopularBookmarks(userId, limit);
  }

  /**
   * 获取最佳学习时间段
   */
  async getBestLearningHours(userId: string, days: number = 30) {
    return this.heatmapStatsService.getBestLearningHours(userId, days);
  }

  /**
   * 获取详细学习报告
   */
  async getDetailedReport(userId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [
      vocabularyStats,
      readingStats,
      bookmarkStats,
      vocabularyTrend,
      readingTrend,
      bookmarkTrend,
      activitySummary,
      bestLearningHours,
    ] = await Promise.all([
      this.getVocabularyStats(userId),
      this.getReadingStats(userId),
      this.getBookmarkStats(userId),
      this.getVocabularyTrend(userId, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
      this.getReadingTrend(userId, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
      this.getBookmarkTrend(userId, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
      this.getActivitySummary(userId, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
      this.getBestLearningHours(userId, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
    ]);

    return {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      },
      overview: {
        vocabulary: vocabularyStats,
        reading: readingStats,
        bookmarks: bookmarkStats,
      },
      trends: {
        vocabulary: vocabularyTrend,
        reading: readingTrend,
        bookmarks: bookmarkTrend,
      },
      insights: {
        activitySummary,
        bestLearningHours,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}

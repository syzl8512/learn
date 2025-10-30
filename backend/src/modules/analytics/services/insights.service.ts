import { Injectable, Logger } from '@nestjs/common';
import { ReadingStatsService } from './reading-stats.service';
import { VocabularyStatsService } from './vocabulary-stats.service';
import { ReadingProgressService } from './reading-progress.service';

export interface LearningInsights {
  strengths: string[]; // 学习优势
  weaknesses: string[]; // 学习弱点
  recommendations: string[]; // 学习建议
  nextGoals: string[]; // 下一步目标
  progressTrend: 'improving' | 'stable' | 'declining'; // 进步趋势
}

export interface WeeklyReport {
  week: string; // 周数
  readingTime: number; // 周阅读时间
  wordsRead: number; // 周阅读单词数
  vocabularyLearned: number; // 周学习词汇数
  booksProgress: number; // 书籍进度
  achievements: string[]; // 成就
  insights: LearningInsights; // 学习洞察
}

export interface MonthlyReport {
  month: string; // 月份
  totalReadingTime: number; // 月总阅读时间
  totalWordsRead: number; // 月总阅读单词数
  vocabularyProgress: number; // 词汇进步
  booksCompleted: number; // 完成书籍数
  readingStreak: number; // 阅读连续天数
  topCategories: string[]; // 热门分类
  insights: LearningInsights; // 学习洞察
}

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private readingStatsService: ReadingStatsService,
    private vocabularyStatsService: VocabularyStatsService,
    private readingProgressService: ReadingProgressService,
  ) {}

  /**
   * 生成学习洞察
   */
  async generateLearningInsights(userId: string): Promise<LearningInsights> {
    try {
      const readingStats = await this.readingStatsService.getUserReadingStats(userId);
      const vocabularyStats = await this.vocabularyStatsService.getUserVocabularyStats(userId);
      const readingProgress = await this.readingProgressService.getUserReadingProgress(userId, 7); // 最近7天

      const insights: LearningInsights = {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        nextGoals: [],
        progressTrend: 'stable',
      };

      // 分析优势
      if (readingStats.readingStreak >= 7) {
        insights.strengths.push('保持良好的阅读习惯');
      }
      if (vocabularyStats.accuracyRate >= 80) {
        insights.strengths.push('词汇掌握准确率较高');
      }
      if (readingStats.averageReadingSpeed >= 200) {
        insights.strengths.push('阅读速度较快');
      }

      // 分析弱点
      if (readingStats.readingStreak < 3) {
        insights.weaknesses.push('阅读习惯需要加强');
      }
      if (vocabularyStats.accuracyRate < 60) {
        insights.weaknesses.push('词汇掌握需要提高');
      }
      if (readingStats.averageReadingSpeed < 100) {
        insights.weaknesses.push('阅读速度有待提升');
      }

      // 生成建议
      if (readingStats.readingStreak < 7) {
        insights.recommendations.push('建议每天保持至少15分钟的阅读时间');
      }
      if (vocabularyStats.newVocabulary > vocabularyStats.masteredVocabulary) {
        insights.recommendations.push('建议增加词汇复习频率');
      }
      if (readingStats.booksCompleted === 0) {
        insights.recommendations.push('建议选择一本感兴趣的书籍开始完整阅读');
      }

      // 设定目标
      insights.nextGoals.push(`目标：连续阅读${Math.max(7, readingStats.readingStreak + 3)}天`);
      insights.nextGoals.push(`目标：词汇准确率达到${Math.min(90, vocabularyStats.accuracyRate + 10)}%`);
      insights.nextGoals.push(`目标：完成${readingStats.booksCompleted + 1}本书籍`);

      // 分析进步趋势
      if (readingProgress.length >= 2) {
        const recentDays = readingProgress.slice(-3);
        const earlierDays = readingProgress.slice(-6, -3);

        const recentAvg = recentDays.reduce((sum, day) => sum + day.readingTime, 0) / recentDays.length;
        const earlierAvg = earlierDays.reduce((sum, day) => sum + day.readingTime, 0) / earlierDays.length;

        if (recentAvg > earlierAvg * 1.1) {
          insights.progressTrend = 'improving';
        } else if (recentAvg < earlierAvg * 0.9) {
          insights.progressTrend = 'declining';
        }
      }

      return insights;
    } catch (error) {
      this.logger.error(`Failed to generate learning insights: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 生成周报告
   */
  async generateWeeklyReport(userId: string): Promise<WeeklyReport> {
    try {
      const readingProgress = await this.readingProgressService.getUserReadingProgress(userId, 7);
      const vocabularyStats = await this.vocabularyStatsService.getUserVocabularyStats(userId);
      const insights = await this.generateLearningInsights(userId);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const week = `${weekStart.toISOString().split('T')[0]} 至 ${new Date().toISOString().split('T')[0]}`;

      const weeklyReport: WeeklyReport = {
        week,
        readingTime: Math.round(readingProgress.reduce((sum, day) => sum + day.readingTime, 0)),
        wordsRead: readingProgress.reduce((sum, day) => sum + day.wordsRead, 0),
        vocabularyLearned: readingProgress.reduce((sum, day) => sum + day.vocabularyAdded, 0),
        booksProgress: 0, // 需要根据具体书籍进度计算
        achievements: [],
        insights,
      };

      // 生成成就
      if (weeklyReport.readingTime >= 300) { // 5小时
        weeklyReport.achievements.push('阅读达人');
      }
      if (weeklyReport.vocabularyLearned >= 20) {
        weeklyReport.achievements.push('词汇收集家');
      }
      if (readingProgress.length >= 5) {
        weeklyReport.achievements.push('坚持阅读');
      }

      return weeklyReport;
    } catch (error) {
      this.logger.error(`Failed to generate weekly report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 生成月报告
   */
  async generateMonthlyReport(userId: string): Promise<MonthlyReport> {
    try {
      const readingProgress = await this.readingProgressService.getUserReadingProgress(userId, 30);
      const readingStats = await this.readingStatsService.getUserReadingStats(userId);
      const vocabularyStats = await this.vocabularyStatsService.getUserVocabularyStats(userId);
      const insights = await this.generateLearningInsights(userId);

      const monthStart = new Date();
      monthStart.setDate(monthStart.getDate() - 30);
      const month = `${monthStart.toISOString().split('T')[0]} 至 ${new Date().toISOString().split('T')[0]}`;

      const monthlyReport: MonthlyReport = {
        month,
        totalReadingTime: Math.round(readingProgress.reduce((sum, day) => sum + day.readingTime, 0)),
        totalWordsRead: readingProgress.reduce((sum, day) => sum + day.wordsRead, 0),
        vocabularyProgress: vocabularyStats.masteredVocabulary,
        booksCompleted: readingStats.booksCompleted,
        readingStreak: readingStats.readingStreak,
        topCategories: [], // 需要根据书籍分类统计
        insights,
      };

      return monthlyReport;
    } catch (error) {
      this.logger.error(`Failed to generate monthly report: ${error.message}`, error.stack);
      throw error;
    }
  }
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { HeatmapData } from '../interfaces';

@Injectable()
export class HeatmapStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取热力图数据（最近30天）
   */
  async getHeatmapData(userId: string, since: Date): Promise<HeatmapData[]> {
    // 获取阅读活动数据
    const readingActivity = await this.prisma.$queryRaw`
      SELECT
        DATE(updated_at) as date,
        COUNT(*) as count,
        FLOOR(SUM(total_reading_seconds) / 60) as minutes
      FROM reading_progress
      WHERE user_id = ${userId} AND updated_at >= ${since}
      GROUP BY DATE(updated_at)
    `;

    // 获取词汇学习活动数据
    const vocabularyActivity = await this.prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count,
        0 as minutes
      FROM vocabulary
      WHERE user_id = ${userId} AND created_at >= ${since}
      GROUP BY DATE(created_at)
    `;

    // 合并两种活动数据
    const activityMap = new Map<string, HeatmapData>();

    // 处理阅读活动
    for (const activity of readingActivity as Array<{date: Date; count: number; minutes: number}>) {
      const date = activity.date.toISOString().split('T')[0];
      activityMap.set(date, {
        date,
        count: Number(activity.count),
        minutes: Number(activity.minutes),
      });
    }

    // 处理词汇活动
    for (const activity of vocabularyActivity as Array<{date: Date; count: number; minutes: number}>) {
      const date = activity.date.toISOString().split('T')[0];
      if (activityMap.has(date)) {
        const existing = activityMap.get(date)!;
        existing.count += Number(activity.count);
      } else {
        activityMap.set(date, {
          date,
          count: Number(activity.count),
          minutes: 0,
        });
      }
    }

    // 填充缺失的日期（设为0）
    const endDate = new Date();
    for (let date = new Date(since); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      if (!activityMap.has(dateStr)) {
        activityMap.set(dateStr, {
          date: dateStr,
          count: 0,
          minutes: 0,
        });
      }
    }

    return Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 获取学习活动总结
   */
  async getActivitySummary(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalReadingDays,
      totalVocabularyDays,
      totalActiveDays,
      totalReadingMinutes,
      totalVocabularyCount,
    ] = await Promise.all([
      // 有阅读活动的天数
      this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT DATE(updated_at)) as days
        FROM reading_progress
        WHERE user_id = ${userId} AND updated_at >= ${startDate}
      `,

      // 有词汇学习活动的天数
      this.prisma.$queryRaw`
        SELECT COUNT(DISTINCT DATE(created_at)) as days
        FROM vocabulary
        WHERE user_id = ${userId} AND created_at >= ${startDate}
      `,

      // 总活跃天数（有任一活动）
      this.prisma.$queryRaw<Array<{days: number}>>`
        WITH reading_days AS (
          SELECT DISTINCT DATE(updated_at) as date FROM reading_progress
          WHERE user_id = ${userId} AND updated_at >= ${startDate}
        ),
        vocabulary_days AS (
          SELECT DISTINCT DATE(created_at) as date FROM vocabulary
          WHERE user_id = ${userId} AND created_at >= ${startDate}
        )
        SELECT COUNT(DISTINCT date) as days
        FROM (SELECT date FROM reading_days UNION SELECT date FROM vocabulary_days) as all_days
      `,

      // 总阅读分钟数
      this.prisma.readingProgress.aggregate({
        where: { userId, updatedAt: { gte: startDate } },
        _sum: { totalReadingSeconds: true },
      }),

      // 总学习词汇数
      this.prisma.vocabulary.count({
        where: { userId, createdAt: { gte: startDate } },
      }),
    ]);

    return {
      totalDays: days,
      readingDays: Number((totalReadingDays as Array<{days: number}>)[0]?.days || 0),
      vocabularyDays: Number((totalVocabularyDays as Array<{days: number}>)[0]?.days || 0),
      activeDays: Number((totalActiveDays as Array<{days: number}>)[0]?.days || 0),
      readingMinutes: Math.floor((totalReadingMinutes._sum.totalReadingSeconds || 0) / 60),
      vocabularyCount: totalVocabularyCount,
      consistencyRate: days > 0
        ? ((Number((totalActiveDays as Array<{days: number}>)[0]?.days || 0) / days) * 100).toFixed(2)
        : '0.00',
    };
  }

  /**
   * 获取最佳学习时间段
   */
  async getBestLearningHours(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const hourlyStats = await this.prisma.$queryRaw`
      SELECT
        EXTRACT(HOUR FROM updated_at) as hour,
        COUNT(*) as sessions,
        FLOOR(SUM(total_reading_seconds) / 60) as minutes
      FROM reading_progress
      WHERE user_id = ${userId} AND updated_at >= ${startDate}
      GROUP BY EXTRACT(HOUR FROM updated_at)
      ORDER BY sessions DESC
      LIMIT 5
    `;

    return hourlyStats;
  }
}
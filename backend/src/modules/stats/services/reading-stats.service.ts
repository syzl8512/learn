import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ReadingStats } from '../interfaces';

@Injectable()
export class ReadingStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取阅读统计
   */
  async getReadingStats(userId: string): Promise<ReadingStats> {
    const [totalProgress, totalReadingTime, completedChapters, readingTimeByWeek] =
      await Promise.all([
        // 总阅读进度记录数
        this.prisma.readingProgress.count({ where: { userId } }),

        // 总阅读时长（分钟）
        this.prisma.readingProgress.aggregate({
          where: { userId },
          _sum: { totalReadingSeconds: true },
        }),

        // 已完成的章节数
        this.prisma.readingProgress.count({
          where: { userId, completionPercentage: { gte: 100 } },
        }),

        // 按周统计阅读时长
        this.getReadingTimeByWeek(userId),
      ]);

    return {
      totalProgress,
      totalReadingMinutes: Math.floor((totalReadingTime._sum.totalReadingSeconds || 0) / 60),
      totalReadingHours: ((totalReadingTime._sum.totalReadingSeconds || 0) / 3600).toFixed(2),
      completedChapters,
      weeklyStats: readingTimeByWeek,
    };
  }

  /**
   * 获取最近阅读记录
   */
  async getRecentReading(userId: string, since: Date) {
    return this.prisma.readingProgress.findMany({
      where: {
        userId,
        updatedAt: { gte: since },
      },
      include: {
        chapter: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }).then(progresses => progresses.map(progress => ({
      id: progress.id,
      bookTitle: progress.chapter.book.title,
      chapterTitle: progress.chapter.title,
      updatedAt: progress.updatedAt,
    })));
  }

  /**
   * 按周统计阅读时长
   */
  private async getReadingTimeByWeek(userId: string) {
    const sevenWeeksAgo = new Date();
    sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 7 * 7);

    const weeklyStats = await this.prisma.$queryRaw<Array<{ week: Date; minutes: bigint }>>`
      SELECT
        DATE_TRUNC('week', updated_at) as week,
        FLOOR(SUM(total_reading_seconds) / 60) as minutes
      FROM reading_progress
      WHERE user_id = ${userId} AND updated_at >= ${sevenWeeksAgo}
      GROUP BY DATE_TRUNC('week', updated_at)
      ORDER BY week ASC
    `;

    return weeklyStats.map((stat) => ({
      week: stat.week.toISOString().split('T')[0],
      minutes: Number(stat.minutes),
    }));
  }

  /**
   * 获取阅读进度趋势（按天统计）
   */
  async getReadingTrend(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await this.prisma.$queryRaw<Array<{date: Date; sessions: number; minutes: number}>>`
      SELECT
        DATE(updated_at) as date,
        COUNT(*) as sessions,
        FLOOR(SUM(total_reading_seconds) / 60) as minutes
      FROM reading_progress
      WHERE user_id = ${userId} AND updated_at >= ${startDate}
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `;

    return dailyStats;
  }
}
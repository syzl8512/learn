import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { VocabularyStats } from '../interfaces';

@Injectable()
export class VocabularyStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取词汇统计
   */
  async getVocabularyStats(userId: string): Promise<VocabularyStats> {
    const [total, mastered, unmastered, needsReview, byPartOfSpeech] = await Promise.all([
      // 总词汇数
      this.prisma.vocabulary.count({ where: { userId } }),

      // 已掌握词汇数
      this.prisma.vocabulary.count({ where: { userId, mastered: true } }),

      // 未掌握词汇数
      this.prisma.vocabulary.count({ where: { userId, mastered: false } }),

      // 需要复习的词汇数
      this.prisma.vocabulary.count({
        where: {
          userId,
          mastered: false,
          nextReviewAt: { lte: new Date() },
        },
      }),

      // 按词性分组统计
      this.prisma.vocabulary.groupBy({
        by: ['partOfSpeech'],
        where: { userId, partOfSpeech: { not: null } },
        _count: true,
      }),
    ]);

    return {
      total,
      mastered,
      unmastered,
      needsReview,
      masteryRate: total > 0 ? ((mastered / total) * 100).toFixed(2) : '0.00',
      byPartOfSpeech: byPartOfSpeech
        .filter((item): item is { partOfSpeech: string; _count: number } => item.partOfSpeech !== null)
        .map((item) => ({
          partOfSpeech: item.partOfSpeech!,
          count: item._count,
        })),
    };
  }

  /**
   * 获取最近新增词汇
   */
  async getRecentVocabulary(userId: string, since: Date) {
    return this.prisma.vocabulary.findMany({
      where: {
        userId,
        createdAt: { gte: since },
      },
      select: {
        id: true,
        word: true,
        pronunciation: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  /**
   * 获取词汇掌握趋势（按天统计）
   */
  async getVocabularyTrend(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await this.prisma.$queryRaw<Array<{date: Date; total: number; mastered: number}>>`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN mastered = true THEN 1 ELSE 0 END) as mastered
      FROM vocabulary
      WHERE user_id = ${userId} AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return dailyStats;
  }
}
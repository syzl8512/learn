import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { BookmarkStats } from '../interfaces';

@Injectable()
export class BookmarkStatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取书签统计
   */
  async getBookmarkStats(userId: string): Promise<BookmarkStats> {
    const [total, recentBookmarks, bookmarksByBook] = await Promise.all([
      // 总书签数
      this.prisma.bookmark.count({ where: { userId } }),

      // 最近创建的书签（最近7天）
      this.prisma.bookmark.count({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      // 按书籍分组统计书签
      this.prisma.bookmark.groupBy({
        by: ['chapterId'],
        where: { userId },
        _count: true,
      }).then(async (groupedBookmarks) => {
        const bookStats = new Map();

        for (const item of groupedBookmarks) {
          const chapter = await this.prisma.chapter.findUnique({
            where: { id: item.chapterId },
            select: {
              id: true,
              title: true,
              book: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          });

          if (chapter && chapter.book) {
            const bookId = chapter.book.id;
            if (!bookStats.has(bookId)) {
              bookStats.set(bookId, {
                bookId,
                bookTitle: chapter.book.title,
                count: 0,
              });
            }
            bookStats.get(bookId).count += item._count;
          }
        }

        return Array.from(bookStats.values());
      }),
    ]);

    return {
      total,
      recent: recentBookmarks,
      byBook: bookmarksByBook,
    };
  }

  /**
   * 获取书签趋势（按天统计）
   */
  async getBookmarkTrend(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await this.prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as bookmarks
      FROM bookmark
      WHERE user_id = ${userId} AND created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return dailyStats;
  }

  /**
   * 获取热门书签（按访问次数统计）
   */
  async getPopularBookmarks(userId: string, limit: number = 10) {
    // 假设书签有访问次数字段，如果没有，可以按创建时间排序
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        chapter: {
          include: {
            book: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
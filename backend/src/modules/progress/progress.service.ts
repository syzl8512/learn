import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { Prisma } from '@prisma/client';

/**
 * 进度服务
 * 提供阅读进度保存、书签管理功能
 */
@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 保存阅读进度
   */
  async saveProgress(userId: string, chapterId: string, saveProgressDto: SaveProgressDto) {
    const {
      currentPosition,
      completionPercentage,
      totalReadingSeconds,
      currentVersion,
      wordsLearned,
    } = saveProgressDto;

    // 检查章节是否存在
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 更新或创建进度记录
    const progress = await this.prisma.readingProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      create: {
        userId,
        chapterId,
        currentPosition,
        completionPercentage,
        totalReadingSeconds,
        currentVersion,
        wordsLearned,
        lastReadAt: new Date(),
      },
      update: {
        currentPosition,
        completionPercentage,
        totalReadingSeconds,
        currentVersion,
        wordsLearned,
        lastReadAt: new Date(),
      },
    });

    return progress;
  }

  /**
   * 获取章节的阅读进度
   */
  async getProgress(userId: string, chapterId: string) {
    const progress = await this.prisma.readingProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            sequenceNumber: true,
            book: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return progress;
  }

  /**
   * 获取用户的所有阅读进度
   */
  async getAllProgress(userId: string, limit: number = 20) {
    return await this.prisma.readingProgress.findMany({
      where: { userId },
      orderBy: { lastReadAt: 'desc' },
      take: limit,
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            sequenceNumber: true,
            book: {
              select: {
                id: true,
                title: true,
                coverUrl: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 创建书签
   */
  async createBookmark(userId: string, chapterId: string, createBookmarkDto: CreateBookmarkDto) {
    // 检查章节是否存在
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        chapterId,
        position: createBookmarkDto.position,
        note: createBookmarkDto.note,
      },
    });

    return bookmark;
  }

  /**
   * 删除书签
   */
  async deleteBookmark(userId: string, bookmarkId: string) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('书签不存在');
    }

    await this.prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
  }

  /**
   * 获取用户的所有书签
   */
  async getBookmarks(userId: string, chapterId?: string) {
    const where: Prisma.BookmarkWhereInput = { userId };
    if (chapterId) {
      where.chapterId = chapterId;
    }

    return await this.prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            sequenceNumber: true,
            book: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 获取用户学习统计（用于仪表板）
   */
  async getStats(userId: string) {
    const [totalProgress, totalBookmarks, recentProgress, readingTimeStats] = await Promise.all([
      // 总阅读进度数
      this.prisma.readingProgress.count({ where: { userId } }),

      // 总书签数
      this.prisma.bookmark.count({ where: { userId } }),

      // 最近阅读的章节（最多5个）
      this.prisma.readingProgress.findMany({
        where: { userId },
        orderBy: { lastReadAt: 'desc' },
        take: 5,
        include: {
          chapter: {
            select: {
              title: true,
              book: { select: { title: true } },
            },
          },
        },
      }),

      // 总阅读时长统计
      this.prisma.readingProgress.aggregate({
        where: { userId },
        _sum: { totalReadingSeconds: true },
      }),
    ]);

    // 最近7天的阅读热力图
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReading = await this.prisma.readingProgress.findMany({
      where: {
        userId,
        lastReadAt: { gte: sevenDaysAgo },
      },
      select: {
        lastReadAt: true,
        totalReadingSeconds: true,
      },
    });

    // 按日期分组
    const dailyReading = recentReading.reduce(
      (acc, item) => {
        const date = item.lastReadAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += item.totalReadingSeconds;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalProgress,
      totalBookmarks,
      totalReadingMinutes: Math.floor((readingTimeStats._sum.totalReadingSeconds || 0) / 60),
      recentProgress: recentProgress.map((p) => ({
        chapterTitle: p.chapter.title,
        bookTitle: p.chapter.book.title,
        completionPercentage: p.completionPercentage,
        lastReadAt: p.lastReadAt,
      })),
      dailyReading: Object.entries(dailyReading).map(([date, seconds]) => ({
        date,
        minutes: Math.floor(seconds / 60),
      })),
    };
  }
}

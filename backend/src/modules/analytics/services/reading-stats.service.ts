import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface ReadingStats {
  totalReadingTime: number; // 总阅读时间（分钟）
  totalWordsRead: number; // 总阅读单词数
  averageReadingSpeed: number; // 平均阅读速度（词/分钟）
  booksCompleted: number; // 完成的书籍数量
  chaptersRead: number; // 阅读的章节数
  vocabularyLearned: number; // 学习的词汇数
  readingStreak: number; // 连续阅读天数
  lastReadingDate: Date; // 最后阅读日期
}

@Injectable()
export class ReadingStatsService {
  private readonly logger = new Logger(ReadingStatsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户阅读统计
   */
  async getUserReadingStats(userId: string): Promise<ReadingStats> {
    try {
      // 获取用户阅读进度记录
      const readingProgresses = await this.prisma.readingProgress.findMany({
        where: { userId },
        include: {
          chapter: {
            include: {
              book: true,
            },
          },
        },
      });

      // 获取用户词汇学习记录
      const vocabularyRecords = await this.prisma.vocabulary.findMany({
        where: { userId },
      });

      // 计算总阅读时间
      const totalReadingTime = readingProgresses.reduce(
        (sum, progress) => sum + (progress.totalReadingSeconds || 0),
        0,
      ) / 60; // 转换为分钟

      // 计算总阅读单词数（基于章节内容长度估算）
      const totalWordsRead = readingProgresses.reduce((sum, progress) => {
        // 从章节内容中获取内容长度，这里需要查询 ChapterContent
        const contentLength = 0; // 暂时设为0，需要单独查询章节内容
        return sum + Math.floor(contentLength / 5); // 估算：5个字符约等于1个单词
      }, 0);

      // 计算平均阅读速度
      const averageReadingSpeed = totalReadingTime > 0
        ? Math.round(totalWordsRead / totalReadingTime)
        : 0;

      // 计算完成的书籍数量
      const booksCompleted = await this.prisma.readingProgress.groupBy({
        by: ['chapterId'],
        where: {
          userId,
          completionPercentage: { gte: 100 },
        },
      }).then(async (completedChapters) => {
        const bookIds = new Set();
        for (const chapter of completedChapters) {
          const chapterData = await this.prisma.chapter.findUnique({
            where: { id: chapter.chapterId },
            select: { bookId: true },
          });
          if (chapterData) {
            bookIds.add(chapterData.bookId);
          }
        }
        return bookIds.size;
      });

      // 计算阅读的章节数
      const chaptersRead = readingProgresses.length;

      // 计算学习的词汇数
      const vocabularyLearned = vocabularyRecords.length;

      // 计算连续阅读天数
      const readingStreak = await this.calculateReadingStreak(userId);

      // 获取最后阅读日期
      const lastReadingDate = readingProgresses.length > 0
        ? new Date(Math.max(...readingProgresses.map(p => p.updatedAt.getTime())))
        : new Date();

      return {
        totalReadingTime: Math.round(totalReadingTime),
        totalWordsRead,
        averageReadingSpeed,
        booksCompleted,
        chaptersRead,
        vocabularyLearned,
        readingStreak,
        lastReadingDate,
      };
    } catch (error) {
      this.logger.error(`Failed to get user reading stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 计算连续阅读天数
   */
  private async calculateReadingStreak(userId: string): Promise<number> {
    try {
      const readingProgresses = await this.prisma.readingProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      if (readingProgresses.length === 0) return 0;

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // 检查今天是否有阅读记录
      const today = new Date().toISOString().split('T')[0];
      const hasTodayReading = readingProgresses.some(p =>
        p.updatedAt.toISOString().split('T')[0] === today
      );

      if (!hasTodayReading) {
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // 从今天或昨天开始向前计算连续天数
      for (let i = 0; i < 365; i++) { // 最多检查一年
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasReadingOnDate = readingProgresses.some(p =>
          p.updatedAt.toISOString().split('T')[0] === dateStr
        );

        if (hasReadingOnDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      this.logger.error(`Failed to calculate reading streak: ${error.message}`, error.stack);
      return 0;
    }
  }
}
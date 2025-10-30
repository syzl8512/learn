import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface ReadingProgress {
  date: string; // 日期
  readingTime: number; // 阅读时间（分钟）
  wordsRead: number; // 阅读单词数
  chaptersCompleted: number; // 完成章节数
  vocabularyAdded: number; // 新增词汇数
}

@Injectable()
export class ReadingProgressService {
  private readonly logger = new Logger(ReadingProgressService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户阅读进度数据
   */
  async getUserReadingProgress(userId: string, days: number = 30): Promise<ReadingProgress[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const readingProgresses = await this.prisma.readingProgress.findMany({
        where: {
          userId,
          updatedAt: { gte: startDate },
        },
        include: {
          chapter: true,
        },
        orderBy: { updatedAt: 'asc' },
      });

      // 按日期分组统计
      const dailyStats = new Map<string, ReadingProgress>();

      for (const progress of readingProgresses) {
        const date = progress.updatedAt.toISOString().split('T')[0];

        if (!dailyStats.has(date)) {
          dailyStats.set(date, {
            date,
            readingTime: 0,
            wordsRead: 0,
            chaptersCompleted: 0,
            vocabularyAdded: 0,
          });
        }

        const dayStats = dailyStats.get(date)!;
        dayStats.readingTime += (progress.totalReadingSeconds || 0) / 60;
        // 暂时设为0，需要单独查询章节内容
        dayStats.wordsRead += 0;

        if (progress.completionPercentage >= 100) {
          dayStats.chaptersCompleted += 1;
        }
      }

      // 获取每日新增词汇数
      const vocabularyRecords = await this.prisma.vocabulary.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      });

      for (const vocab of vocabularyRecords) {
        const date = vocab.createdAt.toISOString().split('T')[0];
        if (dailyStats.has(date)) {
          dailyStats.get(date)!.vocabularyAdded += 1;
        }
      }

      return Array.from(dailyStats.values()).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      this.logger.error(`Failed to get user reading progress: ${error.message}`, error.stack);
      throw error;
    }
  }
}
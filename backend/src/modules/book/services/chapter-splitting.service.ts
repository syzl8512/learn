import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ChapterSplitterService } from '../../../ai-pipeline/chapter-splitter/chapter-splitter.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface ChapterSplittingJobData {
  bookId: string;
  title: string;
  content: string;
}

export interface ChapterInfo {
  id: string;
  title: string;
  sequenceNumber: number;
  wordCount: number;
  status: string;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ChapterSplittingService {
  private readonly logger = new Logger(ChapterSplittingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chapterSplitter: ChapterSplitterService,
    @InjectQueue('chapter-splitting') private readonly chapterSplittingQueue: Queue,
  ) {}

  /**
   * 开始分册处理
   */
  async startChapterSplitting(bookId: string) {
    try {
      // 检查书籍是否存在
      const book = await this.prisma.book.findUnique({
        where: { id: bookId },
        include: {
          chapters: true,
        },
      });

      if (!book) {
        throw new NotFoundException('书籍不存在');
      }

      // 检查是否已经有章节
      if (book.chapters.length > 0) {
        return {
          jobId: 'already_completed',
          message: '书籍已经分册完成',
          status: 'completed',
          chapters: book.chapters,
        };
      }

      // 获取书籍的原始内容（从第一个章节或书籍描述中获取）
      let content = '';
      if (book.chapters.length > 0) {
        const firstChapter = await this.prisma.chapter.findFirst({
          where: { bookId },
          include: {
            chapterContents: {
              where: { version: 'original' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });
        content = firstChapter?.chapterContents[0]?.content || '';
      }

      if (!content) {
        throw new Error('无法获取书籍内容进行分册');
      }

      // 将分册任务加入队列
      const job = await this.chapterSplittingQueue.add(
        'split-chapters',
        {
          bookId,
          title: book.title,
          content,
        } as ChapterSplittingJobData,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );

      this.logger.log(`分册任务已加入队列: Job ID ${job.id}`);

      return {
        jobId: job.id.toString(),
        message: '分册处理已开始',
        status: 'queued',
      };
    } catch (error) {
      this.logger.error(`开始分册处理失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取分册进度
   */
  async getSplitProgress(bookId: string, jobId: string) {
    try {
      if (jobId === 'already_completed') {
        const chapters = await this.getBookChapters(bookId);
        return {
          jobId,
          status: 'completed',
          progress: 100,
          message: '分册处理已完成',
          chapters: chapters.chapters,
        };
      }

      const job = await this.chapterSplittingQueue.getJob(jobId);
      if (!job) {
        throw new Error('任务不存在');
      }

      const state = await job.getState();
      const progress = job.progress();

      let message = '分册处理中...';
      let chapters: ChapterInfo[] = [];

      if (state === 'completed') {
        message = '分册处理完成';
        const result = await this.getBookChapters(bookId);
        chapters = result.chapters;
      } else if (state === 'failed') {
        message = '分册处理失败';
      }

      return {
        jobId,
        status: state,
        progress: typeof progress === 'number' ? progress : 0,
        message,
        chapters,
      };
    } catch (error) {
      this.logger.error(`获取分册进度失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取书籍章节列表
   */
  async getBookChapters(bookId: string) {
    try {
      const chapters = await this.prisma.chapter.findMany({
        where: { bookId },
        orderBy: { sequenceNumber: 'asc' },
        include: {
          chapterContents: {
            where: { version: 'original' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const chapterInfos: ChapterInfo[] = chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        sequenceNumber: chapter.sequenceNumber,
        wordCount: chapter.chapterContents[0]?.wordCount || 0,
        status: chapter.status,
        content: chapter.chapterContents[0]?.content,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      }));

      return {
        chapters: chapterInfos,
        total: chapterInfos.length,
      };
    } catch (error) {
      this.logger.error(`获取章节列表失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取章节详情
   */
  async getChapterDetail(bookId: string, chapterId: string) {
    try {
      const chapter = await this.prisma.chapter.findFirst({
        where: {
          id: chapterId,
          bookId,
        },
        include: {
          chapterContents: {
            where: { version: 'original' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!chapter) {
        throw new NotFoundException('章节不存在');
      }

      return {
        id: chapter.id,
        title: chapter.title,
        sequenceNumber: chapter.sequenceNumber,
        wordCount: chapter.chapterContents[0]?.wordCount || 0,
        status: chapter.status,
        content: chapter.chapterContents[0]?.content,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      };
    } catch (error) {
      this.logger.error(`获取章节详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }
}

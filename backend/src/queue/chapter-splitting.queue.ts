import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChapterSplitterService } from '../ai-pipeline/chapter-splitter/chapter-splitter.service';
import { ChapterSplittingJobData } from '../modules/book/services/chapter-splitting.service';

@Processor('chapter-splitting')
export class ChapterSplittingProcessor {
  private readonly logger = new Logger(ChapterSplittingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chapterSplitter: ChapterSplitterService,
  ) {}

  /**
   * 处理章节分割任务
   */
  @Process('split-chapters')
  async handleChapterSplitting(job: Job<ChapterSplittingJobData>) {
    const { bookId, title, content } = job.data;

    this.logger.log(`开始分册处理: ${bookId} - ${title}`);

    try {
      // 更新书籍状态为处理中
      await this.prisma.book.update({
        where: { id: bookId },
        data: { status: 'processing' },
      });

      await job.progress(10);

      // 使用章节分割器分割内容
      this.logger.log(`[1/3] 开始章节分割...`);
      const chapters = await this.chapterSplitter.splitIntoChapters(content, {
        bookId,
        title,
      });

      this.logger.log(`章节分割完成，共 ${chapters.length} 个章节`);
      await job.progress(50);

      // 存储章节到数据库
      this.logger.log(`[2/3] 存储章节到数据库...`);
      await this.prisma.$transaction(
        chapters.map((chapter, index) =>
          this.prisma.chapter.create({
            data: {
              bookId,
              sequenceNumber: index + 1,
              title: chapter.title,
              status: 'published',
              chapterContents: {
                create: {
                  version: 'original',
                  content: chapter.content,
                  wordCount: this.countWords(chapter.content),
                  sentenceCount: this.countSentences(chapter.content),
                  processedBy: 'ai',
                  processedAt: new Date(),
                  processingLog: {
                    splitMethod: 'ai-chapter-splitter',
                    processedAt: new Date().toISOString(),
                  },
                },
              },
            },
          }),
        ),
      );

      await job.progress(80);

      // 更新书籍状态为已完成
      this.logger.log(`[3/3] 更新书籍状态...`);
      await this.prisma.book.update({
        where: { id: bookId },
        data: { 
          status: 'published',
          publishedAt: new Date(),
        },
      });

      await job.progress(100);

      this.logger.log(`分册处理完成: ${bookId} - 共 ${chapters.length} 个章节`);
      
      return {
        success: true,
        chaptersCount: chapters.length,
        message: '分册处理完成',
      };
    } catch (error) {
      this.logger.error(`分册处理失败: ${error.message}`, error.stack);
      
      // 更新书籍状态为失败
      await this.prisma.book.update({
        where: { id: bookId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  /**
   * 计算单词数
   */
  private countWords(text: string): number {
    if (!text) return 0;
    // 简单的单词计数，可以根据需要优化
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * 计算句子数
   */
  private countSentences(text: string): number {
    if (!text) return 0;
    // 简单的句子计数，可以根据需要优化
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }
}

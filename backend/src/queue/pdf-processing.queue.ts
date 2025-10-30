import { Processor, Process, OnQueueError, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@config/prisma.service';
import { MinerUService } from '@ai-pipeline/minerU/minerU.service';
import { ChapterSplitterService } from '../ai-pipeline/chapter-splitter/chapter-splitter.service';
import { QualityCheckService } from '../ai-pipeline/quality-check/quality-check.service';
import { StorageService } from '../ai-pipeline/storage/storage.service';
import { BookInfoService } from '../modules/book/services/book-info.service';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * PDF 处理任务数据接口
 */
export interface PdfProcessingJobData {
  bookId: string;
  pdfFilePath: string;
  title: string;
}

/**
 * PDF 处理队列处理器
 *
 * 工作流程：
 * 1. PDF → Markdown (MinerU)
 * 2. Markdown → 章节分割 (ChapterSplitter)
 * 3. 质量检查 (QualityCheck)
 * 4. 存储到数据库 (Prisma)
 */
@Processor('pdf-processing')
export class PdfProcessingProcessor {
  private readonly logger = new Logger(PdfProcessingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minerUService: MinerUService,
    private readonly chapterSplitter: ChapterSplitterService,
    private readonly qualityCheck: QualityCheckService,
    private readonly storage: StorageService,
    private readonly bookInfoService: BookInfoService,
  ) {}

  /**
   * 处理 PDF 文件转换和章节分割
   */
  @Process('convert-and-split')
  async handlePdfProcessing(job: Job<PdfProcessingJobData>) {
    const { bookId, pdfFilePath, title } = job.data;

    this.logger.log(`开始处理书籍: ${bookId} - ${title}`);
    this.logger.log(`PDF 文件路径: ${pdfFilePath}`);

    try {
      // 更新书籍状态为 processing
      await this.prisma.book.update({
        where: { id: bookId },
        data: { status: 'processing' },
      });

      // 步骤 1: 使用 MinerU 将 PDF 转换为 Markdown
      this.logger.log(`[1/4] PDF → Markdown 转换中...`);
      await job.progress(10);

      const markdownResult = await this.minerUService.convertPdfToMarkdown(pdfFilePath, {
        bookId,
        title,
      });

      if (!markdownResult.success) {
        throw new Error(`PDF 转换失败: ${markdownResult.error}`);
      }

      this.logger.log(`PDF 转换成功，生成 Markdown 文件: ${markdownResult.markdownPath}`);
      await job.progress(30);

      // 步骤 2: 章节分割
      this.logger.log(`[2/5] 章节分割中...`);
      const chapters = await this.chapterSplitter.splitIntoChapters(
        markdownResult.markdownContent || '',
        { bookId, title },
      );

      this.logger.log(`章节分割完成，共 ${chapters.length} 个章节`);
      await job.progress(40);

      // 步骤 3: 从内容中提取书籍信息
      this.logger.log(`[3/5] 提取书籍信息中...`);
      const bookInfo = await this.chapterSplitter.extractBookInfo(
        markdownResult.markdownContent || '',
        title
      );

      // 更新书籍信息
      await this.prisma.book.update({
        where: { id: bookId },
        data: {
          title: bookInfo.title, // 使用AI提取的标题
          author: bookInfo.author,
          description: bookInfo.description,
          category: bookInfo.category,
          originalLexile: bookInfo.originalLexile,
          recommendedAge: bookInfo.recommendedAge,
          tags: bookInfo.tags ? bookInfo.tags.join(',') : null,
        },
      });

      this.logger.log(`书籍信息提取完成: ${bookInfo.title} - ${bookInfo.author}`);
      await job.progress(60);

      // 步骤 4: 质量检查
      this.logger.log(`[4/5] 质量检查中...`);
      const qualityResults = await Promise.all(
        chapters.map((chapter) =>
          this.qualityCheck.checkContent({
            content: chapter.content,
            chapterTitle: chapter.title,
            bookId,
          }),
        ),
      );

      const allPassed = qualityResults.every((result) => result.passed);
      if (!allPassed) {
        this.logger.warn(
          `质量检查发现问题，但继续处理。问题数: ${qualityResults.filter((r) => !r.passed).length}`,
        );
      }

      await job.progress(80);

      // 步骤 5: 存储到数据库
      this.logger.log(`[5/5] 存储章节到数据库...`);

      // 使用事务批量创建章节
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
                    qualityCheck: qualityResults[index] as any,
                    processedAt: new Date().toISOString(),
                  },
                },
              },
            },
          }),
        ),
      );

      // 更新书籍状态为 published
      await this.prisma.book.update({
        where: { id: bookId },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      });

      // 清理临时文件
      await fs.remove(pdfFilePath);
      if (markdownResult.markdownPath) {
        await fs.remove(path.dirname(markdownResult.markdownPath));
      }

      this.logger.log(`书籍处理完成: ${bookId} - ${title}`);
      await job.progress(100);

      return {
        bookId,
        chaptersCount: chapters.length,
        status: 'success',
      };
    } catch (error) {
      this.logger.error(`书籍处理失败: ${error.message}`, error.stack);

      // 更新书籍状态为 draft（处理失败）
      await this.prisma.book.update({
        where: { id: bookId },
        data: {
          status: 'draft',
        },
      });

      throw error;
    }
  }

  /**
   * 错误处理
   */
  @OnQueueError()
  onError(error: Error) {
    this.logger.error(`队列发生错误: ${error.message}`, error.stack);
  }

  /**
   * 任务失败处理
   */
  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`任务失败 [Job ${job.id}]: ${error.message}`, error.stack);
  }

  /**
   * 统计单词数
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * 统计句子数
   */
  private countSentences(text: string): number {
    return (text.match(/[.!?]+/g) || []).length;
  }
}

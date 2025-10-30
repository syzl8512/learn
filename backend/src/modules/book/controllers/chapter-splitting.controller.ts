import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChapterSplittingService } from '../services/chapter-splitting.service';

@ApiTags('章节分割')
@Controller('books')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChapterSplittingController {
  private readonly logger = new Logger(ChapterSplittingController.name);

  constructor(private readonly chapterSplittingService: ChapterSplittingService) {}

  /**
   * 开始分册处理
   */
  @Post(':bookId/split-chapters')
  @ApiOperation({ summary: '开始分册处理' })
  @ApiResponse({
    status: 201,
    description: '分册处理已开始',
    schema: {
      example: {
        jobId: 'job_123',
        message: '分册处理已开始',
        status: 'queued',
      },
    },
  })
  async splitChapters(@Param('bookId') bookId: string) {
    try {
      const result = await this.chapterSplittingService.startChapterSplitting(bookId);
      return result;
    } catch (error) {
      this.logger.error(`分册处理失败: ${error.message}`, error.stack);
      throw new BadRequestException('分册处理失败');
    }
  }

  /**
   * 获取分册进度
   */
  @Get(':bookId/split-progress/:jobId')
  @ApiOperation({ summary: '获取分册进度' })
  @ApiResponse({
    status: 200,
    description: '分册进度信息',
    schema: {
      example: {
        jobId: 'job_123',
        status: 'completed',
        progress: 100,
        message: '分册处理完成',
        chapters: [
          {
            id: 'chapter_1',
            title: '第1章',
            sequenceNumber: 1,
            wordCount: 5000,
            status: 'completed',
          },
        ],
      },
    },
  })
  async getSplitProgress(
    @Param('bookId') bookId: string,
    @Param('jobId') jobId: string,
  ) {
    try {
      const progress = await this.chapterSplittingService.getSplitProgress(bookId, jobId);
      return progress;
    } catch (error) {
      this.logger.error(`获取分册进度失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取分册进度失败');
    }
  }

  /**
   * 获取书籍章节列表
   */
  @Get(':bookId/chapters')
  @ApiOperation({ summary: '获取书籍章节列表' })
  @ApiResponse({
    status: 200,
    description: '章节列表',
    schema: {
      example: {
        chapters: [
          {
            id: 'chapter_1',
            title: '第1章',
            sequenceNumber: 1,
            wordCount: 5000,
            status: 'completed',
            content: '章节内容...',
          },
        ],
        total: 10,
      },
    },
  })
  async getBookChapters(@Param('bookId') bookId: string) {
    try {
      const chapters = await this.chapterSplittingService.getBookChapters(bookId);
      return chapters;
    } catch (error) {
      this.logger.error(`获取章节列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取章节列表失败');
    }
  }

  /**
   * 获取章节详情
   */
  @Get(':bookId/chapters/:chapterId')
  @ApiOperation({ summary: '获取章节详情' })
  @ApiResponse({
    status: 200,
    description: '章节详情',
    schema: {
      example: {
        id: 'chapter_1',
        title: '第1章',
        sequenceNumber: 1,
        wordCount: 5000,
        status: 'completed',
        content: '章节内容...',
        createdAt: '2025-10-28T10:00:00Z',
        updatedAt: '2025-10-28T10:00:00Z',
      },
    },
  })
  async getChapterDetail(
    @Param('bookId') bookId: string,
    @Param('chapterId') chapterId: string,
  ) {
    try {
      const chapter = await this.chapterSplittingService.getChapterDetail(bookId, chapterId);
      return chapter;
    } catch (error) {
      this.logger.error(`获取章节详情失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取章节详情失败');
    }
  }
}

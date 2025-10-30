import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ChapterService } from '../chapter/chapter.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * 书籍章节控制器 (嵌套路由)
 * 路由: /api/books/:bookId/chapters
 */
@ApiTags('书籍管理')
@Controller('books/:bookId/chapters')
export class BookChaptersController {
  private readonly logger = new Logger(BookChaptersController.name);

  constructor(private readonly chapterService: ChapterService) {}

  /**
   * 获取某本书的所有章节
   */
  @Public()
  @Get()
  @ApiOperation({ summary: '获取书籍的所有章节' })
  @ApiParam({ name: 'bookId', description: '书籍ID' })
  @ApiResponse({ status: 200, description: '返回章节列表' })
  async findByBook(@Param('bookId') bookId: string) {
    this.logger.log(`获取书籍章节列表: bookId=${bookId}`);
    return this.chapterService.getBookChapters(bookId);
  }
}

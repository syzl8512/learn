import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('进度管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(private readonly progressService: ProgressService) {}

  @Post('chapters/:chapterId')
  @ApiOperation({ summary: '保存章节阅读进度' })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
  @ApiResponse({ status: 200, description: '保存成功' })
  async saveProgress(
    @CurrentUser('sub') userId: string,
    @Param('chapterId') chapterId: string,
    @Body() saveProgressDto: SaveProgressDto,
  ) {
    this.logger.log(`保存阅读进度: ${userId}, 章节: ${chapterId}`);
    return this.progressService.saveProgress(userId, chapterId, saveProgressDto);
  }

  @Get('chapters/:chapterId')
  @ApiOperation({ summary: '获取章节阅读进度' })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async getProgress(@CurrentUser('sub') userId: string, @Param('chapterId') chapterId: string) {
    this.logger.log(`获取阅读进度: ${userId}, 章节: ${chapterId}`);
    return this.progressService.getProgress(userId, chapterId);
  }

  @Get()
  @ApiOperation({ summary: '获取用户所有阅读进度' })
  @ApiResponse({ status: 200, description: '成功' })
  async getAllProgress(@CurrentUser('sub') userId: string, @Query('limit') limit?: number) {
    this.logger.log(`获取所有阅读进度: ${userId}`);
    return this.progressService.getAllProgress(userId, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户学习统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async getStats(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取学习统计: ${userId}`);
    return this.progressService.getStats(userId);
  }

  @Post('bookmarks/:chapterId')
  @ApiOperation({ summary: '创建书签' })
  @ApiParam({ name: 'chapterId', description: '章节ID' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createBookmark(
    @CurrentUser('sub') userId: string,
    @Param('chapterId') chapterId: string,
    @Body() createBookmarkDto: CreateBookmarkDto,
  ) {
    this.logger.log(`创建书签: ${userId}, 章节: ${chapterId}`);
    return this.progressService.createBookmark(userId, chapterId, createBookmarkDto);
  }

  @Delete('bookmarks/:bookmarkId')
  @ApiOperation({ summary: '删除书签' })
  @ApiParam({ name: 'bookmarkId', description: '书签ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteBookmark(
    @CurrentUser('sub') userId: string,
    @Param('bookmarkId') bookmarkId: string,
  ) {
    this.logger.log(`删除书签: ${bookmarkId}`);
    await this.progressService.deleteBookmark(userId, bookmarkId);
    return { message: '删除成功' };
  }

  @Get('bookmarks')
  @ApiOperation({ summary: '获取用户书签列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async getBookmarks(@CurrentUser('sub') userId: string, @Query('chapterId') chapterId?: string) {
    this.logger.log(`获取书签列表: ${userId}`);
    return this.progressService.getBookmarks(userId, chapterId);
  }
}

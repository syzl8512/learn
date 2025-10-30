import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('统计分析')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  private readonly logger = new Logger(StatsController.name);

  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '获取学习仪表板统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async getDashboard(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取仪表板统计: ${userId}`);
    return this.statsService.getDashboardStats(userId);
  }

  @Get('detailed-report')
  @ApiOperation({ summary: '获取详细学习报告' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期 (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: '成功' })
  async getDetailedReport(
    @CurrentUser('sub') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    this.logger.log(`获取详细报告: ${userId}, ${startDate} ~ ${endDate}`);
    return this.statsService.getDetailedReport(userId, startDate, endDate);
  }

  @Get('vocabulary')
  @ApiOperation({ summary: '获取词汇统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async getVocabularyStats(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取词汇统计: ${userId}`);
    const dashboard = await this.statsService.getDashboardStats(userId);
    return dashboard.vocabulary;
  }

  @Get('reading')
  @ApiOperation({ summary: '获取阅读统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async getReadingStats(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取阅读统计: ${userId}`);
    const dashboard = await this.statsService.getDashboardStats(userId);
    return dashboard.reading;
  }

  @Get('heatmap')
  @ApiOperation({ summary: '获取学习热力图数据（最近30天）' })
  @ApiResponse({ status: 200, description: '成功' })
  async getHeatmap(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取热力图数据: ${userId}`);
    const dashboard = await this.statsService.getDashboardStats(userId);
    return dashboard.heatmap;
  }

  @Get('recent-vocabulary')
  @ApiOperation({ summary: '获取最近新增词汇（最近7天）' })
  @ApiResponse({ status: 200, description: '成功' })
  async getRecentVocabulary(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取最近词汇: ${userId}`);
    const dashboard = await this.statsService.getDashboardStats(userId);
    return dashboard.recentVocabulary;
  }

  @Get('recent-reading')
  @ApiOperation({ summary: '获取最近阅读记录（最近7天）' })
  @ApiResponse({ status: 200, description: '成功' })
  async getRecentReading(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取最近阅读: ${userId}`);
    const dashboard = await this.statsService.getDashboardStats(userId);
    return dashboard.recentReading;
  }

  @Get('bookmarks')
  @ApiOperation({ summary: '获取书签统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async getBookmarkStats(@CurrentUser('sub') userId: string) {
    this.logger.log(`获取书签统计: ${userId}`);
    const dashboard = await this.statsService.getDashboardStats(userId);
    return dashboard.bookmarks;
  }
}

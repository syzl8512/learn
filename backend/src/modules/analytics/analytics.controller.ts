import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService, ReadingStats, ReadingProgress, VocabularyStats, LearningInsights, WeeklyReport, MonthlyReport } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    wechatId: string;
    nickname: string;
    avatar: string;
    role: string;
    lexileScore: number;
    lexileLevel: string;
    createdAt: Date;
  };
}

@ApiTags('数据分析')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('reading-stats')
  @ApiOperation({ summary: '获取用户阅读统计' })
  @ApiResponse({ status: 200, description: '成功获取阅读统计', type: Object })
  @ApiResponse({ status: 500, description: '获取统计失败' })
  async getReadingStats(@Req() req: AuthenticatedRequest): Promise<ReadingStats> {
    const userId = req.user.id;
    return this.analyticsService.getUserReadingStats(userId);
  }

  @Get('reading-progress')
  @ApiOperation({ summary: '获取用户阅读进度数据' })
  @ApiQuery({ name: 'days', required: false, description: '统计天数，默认30天', example: 30 })
  @ApiResponse({ status: 200, description: '成功获取阅读进度数据', type: [Object] })
  @ApiResponse({ status: 500, description: '获取进度数据失败' })
  async getReadingProgress(
    @Req() req: AuthenticatedRequest,
    @Query('days') days?: number,
  ): Promise<ReadingProgress[]> {
    const userId = req.user.id;
    return this.analyticsService.getUserReadingProgress(userId, days || 30);
  }

  @Get('vocabulary-stats')
  @ApiOperation({ summary: '获取用户词汇统计' })
  @ApiResponse({ status: 200, description: '成功获取词汇统计', type: Object })
  @ApiResponse({ status: 500, description: '获取词汇统计失败' })
  async getVocabularyStats(@Req() req: AuthenticatedRequest): Promise<VocabularyStats> {
    const userId = req.user.id;
    return this.analyticsService.getUserVocabularyStats(userId);
  }

  @Get('learning-insights')
  @ApiOperation({ summary: '获取学习洞察' })
  @ApiResponse({ status: 200, description: '成功获取学习洞察', type: Object })
  @ApiResponse({ status: 500, description: '获取学习洞察失败' })
  async getLearningInsights(@Req() req: AuthenticatedRequest): Promise<LearningInsights> {
    const userId = req.user.id;
    return this.analyticsService.generateLearningInsights(userId);
  }

  @Get('weekly-report')
  @ApiOperation({ summary: '生成周报告' })
  @ApiResponse({ status: 200, description: '成功生成周报告', type: Object })
  @ApiResponse({ status: 500, description: '生成周报告失败' })
  async getWeeklyReport(@Req() req: AuthenticatedRequest): Promise<WeeklyReport> {
    const userId = req.user.id;
    return this.analyticsService.generateWeeklyReport(userId);
  }

  @Get('monthly-report')
  @ApiOperation({ summary: '生成月报告' })
  @ApiResponse({ status: 200, description: '成功生成月报告', type: Object })
  @ApiResponse({ status: 500, description: '生成月报告失败' })
  async getMonthlyReport(@Req() req: AuthenticatedRequest): Promise<MonthlyReport> {
    const userId = req.user.id;
    return this.analyticsService.generateMonthlyReport(userId);
  }

  @Get('dashboard')
  @ApiOperation({ summary: '获取分析仪表板数据' })
  @ApiResponse({ status: 200, description: '成功获取仪表板数据', type: Object })
  @ApiResponse({ status: 500, description: '获取仪表板数据失败' })
  async getDashboard(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    
    try {
      const [readingStats, vocabularyStats, readingProgress, insights] = await Promise.all([
        this.analyticsService.getUserReadingStats(userId),
        this.analyticsService.getUserVocabularyStats(userId),
        this.analyticsService.getUserReadingProgress(userId, 30),
        this.analyticsService.generateLearningInsights(userId),
      ]);

      return {
        readingStats,
        vocabularyStats,
        readingProgress,
        insights,
        summary: {
          totalReadingTime: readingStats.totalReadingTime,
          totalWordsRead: readingStats.totalWordsRead,
          vocabularyLearned: readingStats.vocabularyLearned,
          readingStreak: readingStats.readingStreak,
          booksCompleted: readingStats.booksCompleted,
          averageReadingSpeed: readingStats.averageReadingSpeed,
          accuracyRate: vocabularyStats.accuracyRate,
          progressTrend: insights.progressTrend,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedRequest } from '../../types/request';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LexileService } from './lexile.service';
import {
  QuickSelectDto,
  ManualInputDto,
  AiAssessmentDto,
  LexileResponseDto,
  UserLexileDto,
  BookRecommendationDto,
} from './dto/lexile.dto';

@ApiTags('Lexile 评估')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lexile')
export class LexileController {
  constructor(private readonly lexileService: LexileService) {}

  /**
   * 快速选择 Lexile 等级
   */
  @Post('quick-select')
  @ApiOperation({ summary: '快速选择 Lexile 等级' })
  @ApiResponse({
    status: 200,
    description: '选择成功',
    type: LexileResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async quickSelect(@Body() dto: QuickSelectDto, @Request() req: AuthenticatedRequest): Promise<LexileResponseDto> {
    return this.lexileService.quickSelect(dto, req.user.id);
  }

  /**
   * 手动输入 Lexile 值
   */
  @Post('manual-input')
  @ApiOperation({ summary: '手动输入 Lexile 值' })
  @ApiResponse({
    status: 200,
    description: '输入成功',
    type: LexileResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async manualInput(@Body() dto: ManualInputDto, @Request() req: AuthenticatedRequest): Promise<LexileResponseDto> {
    return this.lexileService.manualInput(dto, req.user.id);
  }

  /**
   * AI 评估 Lexile
   */
  @Post('ai-assessment')
  @ApiOperation({ summary: 'AI 评估 Lexile 水平' })
  @ApiResponse({
    status: 200,
    description: '评估成功',
    type: LexileResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误或 AI 服务不可用' })
  @ApiResponse({ status: 401, description: '未授权' })
  async aiAssessment(@Body() dto: AiAssessmentDto): Promise<LexileResponseDto> {
    return this.lexileService.aiAssessment(dto);
  }

  /**
   * 获取用户当前 Lexile
   */
  @Get('my-lexile')
  @ApiOperation({ summary: '获取用户当前 Lexile' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: UserLexileDto,
  })
  @ApiResponse({ status: 404, description: '用户未进行 Lexile 评估' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getMyLexile(@Request() req: AuthenticatedRequest): Promise<UserLexileDto | null> {
    return this.lexileService.getUserLexile(req.user.id);
  }

  /**
   * 获取书籍推荐版本
   */
  @Get('books/:bookId/recommendation')
  @ApiOperation({ summary: '获取书籍推荐版本' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: BookRecommendationDto,
  })
  @ApiResponse({ status: 400, description: '用户未进行 Lexile 评估' })
  @ApiResponse({ status: 404, description: '书籍不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getBookRecommendation(
    @Param('bookId') bookId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BookRecommendationDto> {
    return this.lexileService.getBookRecommendation(bookId, req.user.id);
  }

  /**
   * 获取书籍详情（包含推荐版本）
   */
  @Get('books/:bookId')
  @ApiOperation({ summary: '获取书籍详情（包含推荐版本）' })
  @ApiQuery({
    name: 'withRecommendedVersion',
    required: false,
    type: Boolean,
    description: '是否包含推荐版本信息',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  @ApiResponse({ status: 404, description: '书籍不存在' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getBookWithRecommendation(
    @Param('bookId') bookId: string,
    @Request() req: AuthenticatedRequest,
    @Query('withRecommendedVersion') withRecommendedVersion?: boolean,
  ) {
    if (withRecommendedVersion) {
      return this.lexileService.getBookWithRecommendation(bookId, req.user.id);
    } else {
      // 返回普通书籍详情（不包含推荐版本）
      return this.lexileService.getBookWithRecommendation(bookId, req.user.id);
    }
  }

  /**
   * 获取 Lexile 统计信息
   */
  @Get('stats')
  @ApiOperation({ summary: '获取 Lexile 统计信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getLexileStats() {
    return this.lexileService.getLexileStats();
  }

  /**
   * 更新用户 Lexile（管理员功能）
   */
  @Patch('users/:userId')
  @ApiOperation({ summary: '更新用户 Lexile（管理员功能）' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: LexileResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async updateUserLexile(
    @Param('userId') userId: string,
    @Body() dto: ManualInputDto,
  ): Promise<LexileResponseDto> {
    return this.lexileService.manualInput(dto, userId);
  }
}

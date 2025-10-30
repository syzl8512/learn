import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ModelScopeService } from '../../ai-pipeline/modelscope/modelscope.service';
import {
  QuickSelectDto,
  ManualInputDto,
  AiAssessmentDto,
  LexileResponseDto,
  UserLexileDto,
  BookRecommendationDto,
  QuickSelectLevel,
  LexileLevel,
} from './dto/lexile.dto';

@Injectable()
export class LexileService {
  private readonly logger = new Logger(LexileService.name);

  constructor(
    private prisma: PrismaService,
    private modelScopeService: ModelScopeService,
    private configService: ConfigService,
  ) {}

  /**
   * 快速选择 Lexile 等级
   */
  async quickSelect(dto: QuickSelectDto, userId: string): Promise<LexileResponseDto> {
    const lexileValue = this.getQuickSelectLexile(dto.level);

    // 更新用户 Lexile
    await this.updateUserLexile(userId, lexileValue, 'quick_select');

    return {
      lexile: lexileValue,
      confidence: 100,
      level: this.getLexileLevel(lexileValue) as any,
      recommendation: this.getQuickSelectRecommendation(dto.level as any),
    };
  }

  /**
   * 手动输入 Lexile 值
   */
  async manualInput(dto: ManualInputDto, userId: string): Promise<LexileResponseDto> {
    // 更新用户 Lexile
    await this.updateUserLexile(userId, dto.lexile, 'manual_input');

    return {
      lexile: dto.lexile,
      confidence: 100,
      level: this.getLexileLevel(dto.lexile) as any,
      recommendation: this.getManualInputRecommendation(dto.lexile as any),
    };
  }

  /**
   * AI 评估 Lexile
   */
  async aiAssessment(dto: AiAssessmentDto): Promise<LexileResponseDto> {
    try {
      // 调用魔搭社区 AI 评估
      const result = await this.modelScopeService.assessLexile({
        knownWords: dto.knownWords,
        unknownWords: dto.unknownWords,
        readingSpeed: parseInt(dto.readingSpeed || '0'),
      });

      // 更新用户 Lexile
      await this.updateUserLexile(dto.userId, result.lexile, 'ai_assessment');

      return {
        lexile: result.lexile,
        confidence: result.confidence,
        level: result.level as any,
        recommendation: result.recommendation,
      };
    } catch (error) {
      this.logger.error('AI 评估失败', error);
      throw new BadRequestException('AI 评估服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 获取用户当前 Lexile
   */
  async getUserLexile(userId: string): Promise<UserLexileDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lexileScore: true,
        lexileLevel: true,
        lexileUpdatedAt: true,
      },
    });

    if (!user || !user.lexileLevel) {
      return null;
    }

    return {
      userId: user.id,
      lexile: user.lexileScore || 0,
      assessmentMethod: 'unknown',
      assessedAt: user.lexileUpdatedAt || new Date(),
    };
  }

  /**
   * 获取推荐书籍版本
   */
  async getBookRecommendation(bookId: string, userId: string): Promise<BookRecommendationDto> {
    // 获取用户 Lexile
    const userLexile = await this.getUserLexile(userId);
    if (!userLexile) {
      throw new BadRequestException('请先完成 Lexile 评估');
    }

    // 获取书籍信息
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('书籍不存在');
    }

    // 计算推荐版本
    const recommendation = this.calculateVersionRecommendation(userLexile.lexile, book?.originalLexile || 0);

    return {
      bookId: book.id,
      recommendedVersion: recommendation.version,
      reason: recommendation.reason,
      matchScore: recommendation.matchScore,
    };
  }

  /**
   * 获取书籍详情（包含推荐版本）
   */
  async getBookWithRecommendation(bookId: string, userId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: {
        chapters: {
          orderBy: { sequenceNumber: 'asc' },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('书籍不存在');
    }

    // 获取推荐版本
    const recommendation = await this.getBookRecommendation(bookId, userId);

    return {
      ...book,
      recommendedVersion: recommendation.recommendedVersion,
      recommendationReason: recommendation.reason,
      matchScore: recommendation.matchScore,
    };
  }

  /**
   * 获取 Lexile 统计信息
   */
  async getLexileStats() {
    const stats = await this.prisma.user.groupBy({
      by: ['lexileLevel'],
      _count: {
        lexileLevel: true,
      },
      where: {
        lexileLevel: {
          not: null,
        },
      },
    });

    return {
      totalAssessed: stats.reduce((sum, stat) => sum + stat._count.lexileLevel, 0),
      distribution: stats.map((stat) => ({
        lexile: stat.lexileLevel,
        count: stat._count.lexileLevel,
        percentage: 0, // 将在前端计算
      })),
    };
  }

  /**
   * 更新用户 Lexile
   */
  private async updateUserLexile(userId: string, lexile: number, method: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lexileScore: lexile,
        lexileLevel: this.getLexileLevel(lexile),
        lexileUpdatedAt: new Date(),
      },
    });

    this.logger.log(`用户 ${userId} Lexile 更新为 ${lexile} (${method})`);
  }

  private getLexileLevel(lexile: number): string {
    if (lexile < 350) return 'beginner';
    if (lexile < 550) return 'ket';
    if (lexile < 750) return 'pet';
    return 'custom';
  }

  /**
   * 获取快速选择对应的 Lexile 值
   */
  private getQuickSelectLexile(level: QuickSelectLevel): number {
    switch (level) {
      case QuickSelectLevel.BEGINNER:
        return 300; // 250-350L 中间值
      case QuickSelectLevel.KET:
        return 450; // 350-550L 中间值
      case QuickSelectLevel.PET:
        return 650; // 550-750L 中间值
      case QuickSelectLevel.CUSTOM:
        return 875; // 750-1000L 中间值
      default:
        return 450;
    }
  }


  /**
   * 获取快速选择建议
   */
  private getQuickSelectRecommendation(level: QuickSelectLevel): string {
    switch (level) {
      case QuickSelectLevel.BEGINNER:
        return '建议阅读 250-350L 的书籍，适合英语初学者';
      case QuickSelectLevel.KET:
        return '建议阅读 350-550L 的书籍，剑桥 KET 水平';
      case QuickSelectLevel.PET:
        return '建议阅读 550-750L 的书籍，剑桥 PET 水平';
      case QuickSelectLevel.CUSTOM:
        return '建议阅读 750-1000L 的书籍，可自定义难度';
      default:
        return '请选择合适的阅读等级';
    }
  }

  /**
   * 获取手动输入建议
   */
  private getManualInputRecommendation(lexile: number): string {
    const range = this.getLexileRange(lexile);

    return `您的 Lexile 水平为 ${lexile}L。建议阅读 ${range} 的书籍。`;
  }

  /**
   * 获取 Lexile 范围
   */
  private getLexileRange(lexile: number): string {
    const lower = Math.max(200, lexile - 100);
    const upper = Math.min(1700, lexile + 100);
    return `${lower}-${upper}L`;
  }

  private getLevelDescription(level: string): string {
    const levelMap: Record<string, string> = {
      'beginner': '初级',
      'ket': 'KET',
      'pet': 'PET',
      'custom': '自定义'
    };
    return levelMap[level] || level;
  }

  /**
   * 计算版本推荐
   */
  private calculateVersionRecommendation(
    userLexile: number,
    bookLexile: number,
  ): { version: string; reason: string; matchScore: number } {
    if (!bookLexile || bookLexile === 0) {
      return {
        version: 'original',
        reason: '无可用版本',
        matchScore: 0,
      };
    }

    // 简化的版本匹配逻辑
    let recommendedVersion = 'original';
    let matchScore = 50;
    let reason = '';

    if (userLexile < 600) {
      recommendedVersion = 'simplified';
      matchScore = 85;
      reason = '基于您的 Lexile 水平，推荐简化版本';
    } else if (userLexile < 1000) {
      recommendedVersion = 'intermediate';
      matchScore = 80;
      reason = '基于您的 Lexile 水平，推荐中级版本';
    } else {
      recommendedVersion = 'original';
      matchScore = 90;
      reason = '基于您的 Lexile 水平，推荐原版';
    }

    return {
      version: recommendedVersion,
      reason,
      matchScore,
    };
  }
}

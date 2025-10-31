import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVocabularyDto, UpdateVocabularyDto, QueryVocabularyDto } from './dto';
import { VocabularyEntity, VocabularyListEntity } from './entities/vocabulary.entity';
import { Prisma } from '@prisma/client';

/**
 * 生词本服务
 * 提供生词的CRUD操作、搜索筛选、统计功能
 */
@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建生词
   */
  async create(
    userId: string,
    createVocabularyDto: CreateVocabularyDto,
  ): Promise<VocabularyEntity> {
    // 检查是否已存在相同单词
    const existing = await this.prisma.vocabulary.findFirst({
      where: {
        userId,
        word: createVocabularyDto.word.toLowerCase(),
      },
    });

    if (existing) {
      throw new BadRequestException('该单词已存在于生词本中');
    }

    // 创建生词
    const vocabulary = await this.prisma.vocabulary.create({
      data: {
        userId,
        word: createVocabularyDto.word.toLowerCase(),
        pronunciation: createVocabularyDto.pronunciation,
        partOfSpeech: createVocabularyDto.partOfSpeech,
        englishDefinition: createVocabularyDto.englishDefinition,
        chineseTranslation: createVocabularyDto.chineseTranslation,
        exampleSentence: createVocabularyDto.exampleSentence,
        exampleTranslation: createVocabularyDto.exampleTranslation,
        sourceType: createVocabularyDto.sourceType,
        sourceChapterId: createVocabularyDto.sourceChapterId,
        sourceListeningId: createVocabularyDto.sourceListeningId,
        notes: createVocabularyDto.notes,
      },
    });

    return vocabulary;
  }

  /**
   * 查询生词列表 (支持搜索、筛选、分页、排序)
   */
  async findAll(userId: string, query: QueryVocabularyDto): Promise<VocabularyListEntity> {
    const {
      search,
      partOfSpeech,
      sourceType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // 构建查询条件
    const where: Prisma.VocabularyWhereInput = {
      userId,
    };

    // 搜索条件
    if (search) {
      where.OR = [
        { word: { contains: search.toLowerCase(), mode: 'insensitive' } },
        { chineseTranslation: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 词性筛选
    if (partOfSpeech) {
      where.partOfSpeech = partOfSpeech;
    }

    // 来源类型筛选
    if (sourceType) {
      where.sourceType = sourceType;
    }

    // 移除了掌握状态筛选功能

    // 日期范围筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询数据
    const [data, total] = await Promise.all([
      this.prisma.vocabulary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.vocabulary.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取生词详情
   */
  async findOne(userId: string, id: string): Promise<VocabularyEntity> {
    const vocabulary = await this.prisma.vocabulary.findFirst({
      where: { id, userId },
    });

    if (!vocabulary) {
      throw new NotFoundException('生词不存在');
    }

    return vocabulary;
  }

  /**
   * 更新生词
   */
  async update(
    userId: string,
    id: string,
    updateVocabularyDto: UpdateVocabularyDto,
  ): Promise<VocabularyEntity> {
    // 检查生词是否存在
    await this.findOne(userId, id);

    const updateData: Prisma.VocabularyUpdateInput = { ...updateVocabularyDto };

    // 更新生词
    const vocabulary = await this.prisma.vocabulary.update({
      where: { id },
      data: updateData,
    });

    return vocabulary;
  }

  /**
   * 删除生词
   */
  async remove(userId: string, id: string): Promise<void> {
    // 检查生词是否存在
    await this.findOne(userId, id);

    await this.prisma.vocabulary.delete({
      where: { id },
    });
  }

  /**
   * 标记复习
   * 简化版本，只更新复习记录
   */
  async markReview(userId: string, id: string): Promise<VocabularyEntity> {
    // 检查生词是否存在
    await this.findOne(userId, id);

    // 简化版本：只返回生词信息，不再更新复习计数和下次复习时间
    return this.findOne(userId, id);
  }

  /**
   * 获取需要复习的生词列表（简化版本）
   */
  async getReviewList(userId: string, limit: number = 20): Promise<VocabularyEntity[]> {
    // 简化版本：按创建时间排序获取最近的生词
    return await this.prisma.vocabulary.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * 计算下次复习日期 (基于艾宾浩斯遗忘曲线)
   * @param reviewCount 复习次数
   * @returns 下次复习日期
   *
   * 遗忘曲线间隔: 1天 -> 3天 -> 7天 -> 15天 -> 30天 -> 60天
   */
  private calculateNextReviewDate(reviewCount: number): Date {
    const now = new Date();
    const intervals = [1, 3, 7, 15, 30, 60]; // 天数

    const daysToAdd = reviewCount < intervals.length ? intervals[reviewCount] : 60; // 超过6次后,每60天复习一次

    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    return nextDate;
  }

  /**
   * 获取用户词汇统计
   */
  async getStats(userId: string) {
    const [total, byPartOfSpeech, bySourceType] = await Promise.all([
      // 总单词数
      this.prisma.vocabulary.count({ where: { userId } }),

      // 按词性分组统计
      this.prisma.vocabulary.groupBy({
        by: ['partOfSpeech'],
        where: { userId, partOfSpeech: { not: null } },
        _count: true,
      }),

      // 按来源类型分组统计
      this.prisma.vocabulary.groupBy({
        by: ['sourceType'],
        where: { userId, sourceType: { not: null } },
        _count: true,
      }),
    ]);

    // 获取最近7天的学习数据 (用于热力图)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentVocabulary = await this.prisma.vocabulary.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    // 按日期分组
    const dailyStats = recentVocabulary.reduce(
      (acc, item) => {
        const date = item.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      mastered: 0, // 掌握功能已移除，设为0
      unmastered: total, // 所有单词都视为未掌握
      masteryRate: '0.00', // 掌握率固定为0
      byPartOfSpeech: byPartOfSpeech.map((item) => ({
        partOfSpeech: item.partOfSpeech,
        count: item._count,
      })),
      bySourceType: bySourceType.map((item) => ({
        sourceType: item.sourceType,
        count: item._count,
      })),
      dailyStats,
    };
  }

  /**
   * 查找单词
   */
  async lookup(word: string): Promise<any> {
    // 实现单词查找逻辑
    return { word, found: true };
  }

  /**
   * 添加到我的词汇
   */
  async addToMyVocabulary(userId: string, data: CreateVocabularyDto): Promise<VocabularyEntity> {
    return this.create(userId, data);
  }

  /**
   * 获取我的词汇
   */
  async getMyVocabulary(userId: string, query: QueryVocabularyDto): Promise<VocabularyListEntity> {
    return this.findAll(userId, query);
  }

  /**
   * 更新我的词汇
   */
  async updateMyVocabulary(userId: string, id: string, data: UpdateVocabularyDto): Promise<VocabularyEntity> {
    return this.update(userId, id, data);
  }

  /**
   * 从我的词汇中删除
   */
  async deleteFromMyVocabulary(userId: string, id: string): Promise<void> {
    return this.remove(userId, id);
  }

  /**
   * 批量删除
   */
  async batchDelete(userId: string, ids: string[]): Promise<void> {
    await this.prisma.vocabulary.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
  }

  /**
   * 获取复习单词
   */
  async getReviewWords(userId: string): Promise<VocabularyEntity[]> {
    return this.prisma.vocabulary.findMany({
      where: {
        userId,
      },
      orderBy: { updatedAt: 'asc' },
    });
  }

  /**
   * 记录复习
   */
  async recordReview(userId: string, vocabularyId: string, _data: any): Promise<VocabularyEntity> {
    // 简化版本：只返回生词信息，不再更新复习计数
    return this.findOne(userId, vocabularyId);
  }

  /**
   * 获取统计信息
   */
  async getStatistics(userId: string): Promise<any> {
    const total = await this.prisma.vocabulary.count({
      where: { userId },
    });

    return {
      total,
      mastered: 0, // 掌握功能已移除，设为0
      unmastered: total, // 所有单词都视为未掌握
      masteryRate: '0.00', // 掌握率固定为0
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface VocabularyStats {
  totalVocabulary: number; // 总词汇数
  masteredVocabulary: number; // 已掌握词汇数
  learningVocabulary: number; // 学习中词汇数
  newVocabulary: number; // 新词汇数
  reviewCount: number; // 复习次数
  accuracyRate: number; // 准确率
  difficultyDistribution: {
    easy: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}

@Injectable()
export class VocabularyStatsService {
  private readonly logger = new Logger(VocabularyStatsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户词汇统计
   */
  async getUserVocabularyStats(userId: string): Promise<VocabularyStats> {
    try {
      const vocabularyRecords = await this.prisma.vocabulary.findMany({
        where: { userId },
      });

      const totalVocabulary = vocabularyRecords.length;

      // 根据掌握程度分类
      // 暂时使用 reviewCount 作为掌握度的替代指标
      const masteredVocabulary = vocabularyRecords.filter(v => (v.reviewCount || 0) >= 4).length;
      const learningVocabulary = vocabularyRecords.filter(v => (v.reviewCount || 0) >= 2 && (v.reviewCount || 0) < 4).length;
      const newVocabulary = vocabularyRecords.filter(v => (v.reviewCount || 0) < 2).length;

      // 计算复习次数
      const reviewCount = vocabularyRecords.reduce((sum, v) => sum + (v.reviewCount || 0), 0);

      // 计算准确率（基于复习记录）
      // TODO: 当前数据模型缺少 correctCount 字段，无法准确计算准确率
      // 建议在 Vocabulary 模型中添加 correctCount 和 incorrectCount 字段
      // 暂时返回 0，待数据模型完善后再实现
      const totalReviews = vocabularyRecords.reduce((sum, v) => sum + (v.reviewCount || 0), 0);
      const accuracyRate = 0; // 暂时返回0，等待数据模型完善

      // 获取词汇难度分布
      const difficultyDistribution = await this.getVocabularyDifficultyDistribution(userId);

      return {
        totalVocabulary,
        masteredVocabulary,
        learningVocabulary,
        newVocabulary,
        reviewCount,
        accuracyRate: Math.round(accuracyRate * 100) / 100,
        difficultyDistribution,
      };
    } catch (error) {
      this.logger.error(`Failed to get user vocabulary stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取词汇难度分布
   */
  private async getVocabularyDifficultyDistribution(userId: string) {
    try {
      const vocabularyRecords = await this.prisma.vocabulary.findMany({
        where: { userId },
      });

      const distribution = { easy: 0, intermediate: 0, advanced: 0, expert: 0 };

      for (const vocab of vocabularyRecords) {
        // 根据掌握程度和复习次数判断难度
        const reviewCount = vocab.reviewCount || 0;
        if (reviewCount >= 4) {
          distribution.easy++;
        } else if (reviewCount >= 3) {
          distribution.intermediate++;
        } else if (reviewCount >= 2) {
          distribution.advanced++;
        } else {
          distribution.expert++;
        }
      }

      return distribution;
    } catch (error) {
      this.logger.error(`Failed to get vocabulary difficulty distribution: ${error.message}`, error.stack);
      return { easy: 0, intermediate: 0, advanced: 0, expert: 0 };
    }
  }
}
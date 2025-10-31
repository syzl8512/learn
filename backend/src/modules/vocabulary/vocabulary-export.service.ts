import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryVocabularyDto } from '../vocabulary/dto/query-vocabulary.dto';
import { Prisma, Vocabulary } from '@prisma/client';

/**
 * 词汇导出服务
 * 提供CSV和Anki格式的生词本导出功能
 */
@Injectable()
export class VocabularyExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 导出CSV格式的生词本
   * @param userId 用户ID
   * @param query 查询参数（用于筛选导出的词汇）
   * @returns CSV格式的字符串
   */
  async exportCSV(userId: string, query?: QueryVocabularyDto): Promise<string> {
    // 获取要导出的词汇数据
    const vocabularyList = await this.getVocabularyForExport(userId, query);

    if (vocabularyList.length === 0) {
      throw new BadRequestException('没有找到要导出的生词');
    }

    // CSV头部
    const headers = [
      '单词',
      '音标',
      '词性',
      '英文释义',
      '中文翻译',
      '例句',
      '例句翻译',
      '创建时间',
      '备注',
    ];

    // 转换数据为CSV行
    const csvRows = vocabularyList.map((vocab) => [
      vocab.word,
      vocab.pronunciation || '',
      vocab.partOfSpeech || '',
      this.escapeCSVField(vocab.englishDefinition || ''),
      this.escapeCSVField(vocab.chineseTranslation || ''),
      this.escapeCSVField(vocab.exampleSentence || ''),
      this.escapeCSVField(vocab.exampleTranslation || ''),
      vocab.createdAt.toISOString().split('T')[0],
      this.escapeCSVField(vocab.notes || ''),
    ]);

    // 组合CSV内容
    const csvContent = [headers, ...csvRows].map((row) => row.join(',')).join('\n');

    // 添加BOM以支持中文
    return '\uFEFF' + csvContent;
  }

  /**
   * 导出Anki格式的生词本
   * @param userId 用户ID
   * @param query 查询参数（用于筛选导出的词汇）
   * @returns Anki格式的字符串
   */
  async exportAnki(userId: string, query?: QueryVocabularyDto): Promise<string> {
    const vocabularyList = await this.getVocabularyForExport(userId, query);

    if (vocabularyList.length === 0) {
      throw new BadRequestException('没有找到要导出的生词');
    }

    // Anki格式：每行一张卡片，字段用制表符分隔
    // 字段顺序：正面(单词) | 反面(释义) | 例句 | 音标 | 备注
    const ankiRows = vocabularyList.map((vocab) => {
      const front = vocab.word; // 正面：单词
      const back = this.buildAnkiBack(vocab); // 反面：释义
      const example = vocab.exampleSentence || ''; // 例句
      const pronunciation = vocab.pronunciation || ''; // 音标
      const notes = vocab.notes || ''; // 备注

      return [front, back, example, pronunciation, notes]
        .map((field) => this.escapeAnkiField(field))
        .join('\t');
    });

    return ankiRows.join('\n');
  }

  /**
   * 获取要导出的词汇数据
   */
  private async getVocabularyForExport(userId: string, query?: QueryVocabularyDto) {
    const where: Prisma.VocabularyWhereInput = { userId };

    // 如果有查询条件，应用筛选
    if (query) {
      if (query.search) {
        where.OR = [
          { word: { contains: query.search.toLowerCase(), mode: 'insensitive' } },
          { chineseTranslation: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      if (query.partOfSpeech) {
        where.partOfSpeech = query.partOfSpeech;
      }

      if (query.sourceType) {
        where.sourceType = query.sourceType;
      }

      // 移除了掌握状态筛选功能

      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) {
          where.createdAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.createdAt.lte = new Date(query.endDate);
        }
      }
    }

    return await this.prisma.vocabulary.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 构建Anki卡片的背面内容
   */
  private buildAnkiBack(vocab: Vocabulary): string {
    const parts = [];

    // 中文翻译（必需）
    if (vocab.chineseTranslation) {
      parts.push(vocab.chineseTranslation);
    }

    // 词性
    if (vocab.partOfSpeech) {
      parts.push(`[${vocab.partOfSpeech}]`);
    }

    // 英文释义
    if (vocab.englishDefinition) {
      parts.push(`英文释义：${vocab.englishDefinition}`);
    }

    // 移除了同义词、反义词和蓝斯值功能

    return parts.join('\n');
  }

  /**
   * 转义CSV字段
   * 处理包含逗号、引号、换行符的字段
   */
  private escapeCSVField(field: string): string {
    // 如果字段包含逗号、引号或换行符，需要用引号包围
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      // 将字段中的引号转义为两个引号
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  /**
   * 转义Anki字段
   * Anki使用制表符分隔字段，所以需要处理制表符和换行符
   */
  private escapeAnkiField(field: string): string {
    // 将制表符替换为空格，换行符替换为<br>
    return field.replace(/\t/g, ' ').replace(/\n/g, '<br>').replace(/\r/g, '');
  }

  /**
   * 获取导出统计信息
   */
  async getExportStats(userId: string, query?: QueryVocabularyDto) {
    const total = await this.prisma.vocabulary.count({ where: { userId } });

    return {
      total,
      mastered: 0, // 掌握功能已移除，设为0
      unmastered: total, // 所有单词都视为未掌握
      masteryRate: '0.00', // 掌握率固定为0
    };
  }
}

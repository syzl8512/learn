import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Vocabulary, Prisma } from '@prisma/client';

/**
 * 生词实体
 * 用于API响应
 */
export class VocabularyEntity implements Vocabulary {
  @ApiProperty({
    description: '生词ID',
    example: 'clx1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: '用户ID',
    example: 'clx0987654321fedcba',
  })
  userId: string;

  @ApiProperty({
    description: '单词',
    example: 'abandon',
  })
  word: string;

  @ApiPropertyOptional({
    description: '音标',
    example: '/əˈbændən/',
    nullable: true,
  })
  pronunciation: string | null;

  @ApiPropertyOptional({
    description: '词性',
    example: 'verb',
    nullable: true,
  })
  partOfSpeech: string | null;

  @ApiPropertyOptional({
    description: '英文释义',
    example:
      'to leave somebody, especially somebody you are responsible for, with no intention of returning',
    nullable: true,
  })
  englishDefinition: string | null;

  @ApiProperty({
    description: '中文翻译',
    example: '放弃; 抛弃',
  })
  chineseTranslation: string;

  @ApiPropertyOptional({
    description: '例句',
    example: 'The baby had been abandoned by its mother.',
    nullable: true,
  })
  exampleSentence: string | null;

  @ApiPropertyOptional({
    description: '例句翻译',
    example: '这个婴儿被母亲遗弃了。',
    nullable: true,
  })
  exampleTranslation: string | null;

  // 移除了同义词、反义词和蓝斯值字段

  @ApiPropertyOptional({
    description: '来源类型',
    example: 'chapter',
    nullable: true,
  })
  sourceType: string | null;

  @ApiPropertyOptional({
    description: '来源章节ID',
    example: 'clx1234567890',
    nullable: true,
  })
  sourceChapterId: string | null;

  @ApiPropertyOptional({
    description: '来源听力ID',
    example: 'clx9876543210',
    nullable: true,
  })
  sourceListeningId: string | null;

  // 移除了掌握相关字段（mastered, masteredAt, nextReviewAt, reviewCount）

  @ApiPropertyOptional({
    description: '用户自定义笔记',
    example: '这个单词在小说第三章出现过',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: '创建时间',
    example: '2025-10-26T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2025-10-26T09:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * 生词列表分页响应实体
 */
export class VocabularyListEntity {
  @ApiProperty({
    description: '生词列表',
    type: [VocabularyEntity],
  })
  data: VocabularyEntity[];

  @ApiProperty({
    description: '总数',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: '总页数',
    example: 5,
  })
  totalPages: number;
}

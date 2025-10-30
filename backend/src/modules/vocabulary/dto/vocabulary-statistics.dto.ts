import { ApiProperty } from '@nestjs/swagger';

/**
 * 词汇统计信息
 */
export class VocabularyStatisticsDto {
  @ApiProperty({
    description: '总词汇数',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '已掌握数',
    example: 30,
  })
  mastered: number;

  @ApiProperty({
    description: '未掌握数',
    example: 70,
  })
  unmastered: number;

  @ApiProperty({
    description: '掌握率（%）',
    example: '30.00',
  })
  masteryRate: string;
}

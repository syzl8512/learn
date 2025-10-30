import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { CreateVocabularyDto } from './create-vocabulary.dto';

/**
 * 更新生词DTO
 * 继承CreateVocabularyDto的所有字段,并添加额外的更新字段
 */
export class UpdateVocabularyDto extends PartialType(CreateVocabularyDto) {
  @ApiPropertyOptional({
    description: '是否已掌握',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  mastered?: boolean;

  @ApiPropertyOptional({
    description: '掌握时间 (ISO 8601格式)',
    example: '2025-10-26T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  masteredAt?: string;

  @ApiPropertyOptional({
    description: '下次复习时间 (ISO 8601格式)',
    example: '2025-10-27T10:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  nextReviewAt?: string;
}

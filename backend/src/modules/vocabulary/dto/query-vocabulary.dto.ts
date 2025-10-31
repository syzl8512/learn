import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartOfSpeech, SourceType } from './create-vocabulary.dto';

/**
 * 排序字段枚举
 */
export enum SortField {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  WORD = 'word',
  // 移除了掌握相关字段，因为数据库模型中已删除这些字段
  // MASTERED_AT = 'masteredAt',
  // NEXT_REVIEW_AT = 'nextReviewAt',
  // REVIEW_COUNT = 'reviewCount',
}

/**
 * 排序方向枚举
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 查询生词列表DTO
 * 支持搜索、筛选、分页、排序
 */
export class QueryVocabularyDto {
  @ApiPropertyOptional({
    description: '搜索关键词 (匹配单词或翻译)',
    example: 'abandon',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: '词性筛选',
    enum: PartOfSpeech,
    example: PartOfSpeech.VERB,
  })
  @IsEnum(PartOfSpeech)
  @IsOptional()
  partOfSpeech?: PartOfSpeech;

  @ApiPropertyOptional({
    description: '来源类型筛选',
    enum: SourceType,
    example: SourceType.CHAPTER,
  })
  @IsEnum(SourceType)
  @IsOptional()
  sourceType?: SourceType;

  // 移除了掌握状态筛选字段，因为数据库模型中已删除这些字段
  // mastered?: boolean;

  @ApiPropertyOptional({
    description: '开始日期 (ISO 8601格式)',
    example: '2025-10-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: '结束日期 (ISO 8601格式)',
    example: '2025-10-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: '页码 (从1开始)',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: '排序字段',
    enum: SortField,
    example: SortField.CREATED_AT,
  })
  @IsEnum(SortField)
  @IsOptional()
  sortBy?: SortField = SortField.CREATED_AT;

  @ApiPropertyOptional({
    description: '排序方向',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}

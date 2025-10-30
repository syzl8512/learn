import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 查询书籍 DTO
 */
export class QueryBookDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '搜索关键词 (标题或作者)',
    example: 'Gatsby',
  })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @ApiPropertyOptional({
    description: '书籍分类',
    example: '小说',
    enum: ['小说', '科普', '传记', '历史', '诗歌', '其他'],
  })
  @IsOptional()
  @IsString({ message: '分类必须是字符串' })
  category?: string;

  @ApiPropertyOptional({
    description: '书籍状态',
    example: 'published',
    enum: ['draft', 'processing', 'published', 'archived'],
  })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;

  @ApiPropertyOptional({
    description: '最小蓝斯值',
    example: 800,
    minimum: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最小蓝斯值必须是数字' })
  @Min(200, { message: '蓝斯值最小为 200L' })
  minLexile?: number;

  @ApiPropertyOptional({
    description: '最大蓝斯值',
    example: 1200,
    maximum: 1700,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最大蓝斯值必须是数字' })
  @Max(1700, { message: '蓝斯值最大为 1700L' })
  maxLexile?: number;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: ['createdAt', 'title', 'originalLexile'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: 'createdAt' | 'title' | 'originalLexile' = 'createdAt';

  @ApiPropertyOptional({
    description: '排序顺序',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString({ message: '排序顺序必须是字符串' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

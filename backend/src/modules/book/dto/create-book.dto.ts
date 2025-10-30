import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

/**
 * 创建书籍 DTO
 */
export class CreateBookDto {
  @ApiProperty({
    description: '书籍标题',
    example: 'The Great Gatsby',
    minLength: 1,
    maxLength: 200,
  })
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  @MinLength(1, { message: '标题长度至少 1 个字符' })
  @MaxLength(200, { message: '标题长度最多 200 个字符' })
  title: string;

  @ApiPropertyOptional({
    description: '作者',
    example: 'F. Scott Fitzgerald',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '作者必须是字符串' })
  @MaxLength(100, { message: '作者长度最多 100 个字符' })
  author?: string;

  @ApiPropertyOptional({
    description: '书籍描述',
    example: 'A classic American novel about the American Dream.',
  })
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @ApiPropertyOptional({
    description: '封面图片 URL',
    example: 'https://example.com/covers/great-gatsby.jpg',
  })
  @IsOptional()
  @IsString({ message: '封面 URL 必须是字符串' })
  coverUrl?: string;

  @ApiPropertyOptional({
    description: '原书蓝斯值',
    example: 1070,
    minimum: 200,
    maximum: 1700,
  })
  @IsOptional()
  @IsNumber({}, { message: '原书蓝斯值必须是数字' })
  @Min(200, { message: '蓝斯值最小为 200L' })
  @Max(1700, { message: '蓝斯值最大为 1700L' })
  originalLexile?: number;

  @ApiPropertyOptional({
    description: '蓝斯值范围',
    example: '1000-1200L',
  })
  @IsOptional()
  @IsString({ message: '蓝斯值范围必须是字符串' })
  lexileRange?: string;

  @ApiPropertyOptional({
    description: '书籍分类',
    example: '小说',
    enum: ['小说', '科普', '传记', '历史', '诗歌', '其他'],
  })
  @IsOptional()
  @IsString({ message: '分类必须是字符串' })
  category?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    example: ['经典', '美国文学', '20世纪'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '标签必须是数组' })
  @IsString({ each: true, message: '每个标签必须是字符串' })
  tags?: string[];

  @ApiPropertyOptional({
    description: '推荐年龄',
    example: '15-18岁',
  })
  @IsOptional()
  @IsString({ message: '推荐年龄必须是字符串' })
  recommendedAge?: string;

  @ApiPropertyOptional({
    description: '书籍状态',
    example: 'draft',
    enum: ['draft', 'processing', 'published', 'archived'],
    default: 'draft',
  })
  @IsOptional()
  @IsString({ message: '状态必须是字符串' })
  status?: string;
}

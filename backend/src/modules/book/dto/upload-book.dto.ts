import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * 书籍上传 DTO
 */
export class UploadBookDto {
  @ApiProperty({
    description: '书名',
    example: "Harry Potter and the Philosopher's Stone",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '作者',
    example: 'J.K. Rowling',
    required: false,
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({
    description: '书籍简介',
    example: "A young wizard's journey begins...",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '分类',
    example: '小说',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: '原书蓝斯值',
    example: 880,
    minimum: 0,
    maximum: 2000,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(2000)
  @IsOptional()
  originalLexile?: number;

  @ApiProperty({
    description: '推荐年龄',
    example: '8-12岁',
    required: false,
  })
  @IsString()
  @IsOptional()
  recommendedAge?: string;

  @ApiProperty({
    description: '标签列表',
    example: ['魔法', '冒险', '友谊'],
    type: [String],
    required: false,
  })
  @IsOptional()
  tags?: string[];
}

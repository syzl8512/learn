import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

/**
 * 查询章节内容 DTO
 */
export class QueryChapterDto {
  @ApiProperty({
    description: '内容版本',
    enum: ['original', 'easy', 'ket', 'pet', 'custom'],
    default: 'original',
    required: false,
  })
  @IsEnum(['original', 'easy', 'ket', 'pet', 'custom'])
  @IsOptional()
  version?: string = 'original';
}

/**
 * 查询书籍章节列表 DTO
 */
export class QueryBookChaptersDto {
  @ApiProperty({
    description: '内容版本（可选）',
    enum: ['original', 'easy', 'ket', 'pet', 'custom'],
    required: false,
  })
  @IsEnum(['original', 'easy', 'ket', 'pet', 'custom'])
  @IsOptional()
  version?: string;
}

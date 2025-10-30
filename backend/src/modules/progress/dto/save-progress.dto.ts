import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class SaveProgressDto {
  @ApiProperty({ description: '当前阅读位置（字符偏移量）' })
  @IsInt()
  @Min(0)
  currentPosition: number;

  @ApiProperty({ description: '完成百分比（0-100）', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @ApiPropertyOptional({ description: '总阅读时长（秒）', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalReadingSeconds?: number;

  @ApiPropertyOptional({
    description: '当前阅读的版本',
    enum: ['original', 'easy', 'ket', 'pet', 'custom'],
    default: 'original',
  })
  @IsOptional()
  @IsString()
  currentVersion?: string;

  @ApiPropertyOptional({ description: '本章学到的单词数', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  wordsLearned?: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, Min, Max, IsEnum } from 'class-validator';

export type LexileLevel = 'beginner' | 'ket' | 'pet' | 'custom';

export const LEXILE_RANGES = {
  beginner: { min: 250, max: 350, label: '初级' },
  ket: { min: 350, max: 550, label: 'KET' },
  pet: { min: 550, max: 750, label: 'PET' },
  custom: { min: 750, max: 1000, label: '自定义' }
} as const;

export enum QuickSelectLevel {
  BEGINNER = 'beginner', // 250-350L
  KET = 'ket', // 350-550L
  PET = 'pet', // 550-750L
  CUSTOM = 'custom', // 750-1000L
}

export class QuickSelectDto {
  @ApiProperty({
    description: '快速选择等级',
    enum: QuickSelectLevel,
    example: QuickSelectLevel.BEGINNER,
  })
  @IsEnum(QuickSelectLevel)
  level: QuickSelectLevel;
}

export class ManualInputDto {
  @ApiProperty({
    description: 'Lexile 值',
    minimum: 200,
    maximum: 1700,
    example: 650,
  })
  @IsNumber()
  @Min(200)
  @Max(1700)
  lexile: number;
}

export class AiAssessmentDto {
  @ApiProperty({
    description: '用户 ID',
    example: 'user-123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: '已知单词列表',
    type: [String],
    example: ['apple', 'book', 'cat', 'dog', 'happy'],
  })
  @IsArray()
  @IsString({ each: true })
  knownWords: string[];

  @ApiProperty({
    description: '未知单词列表',
    type: [String],
    example: ['magnificent', 'extraordinary', 'comprehend'],
  })
  @IsArray()
  @IsString({ each: true })
  unknownWords: string[];

  @ApiProperty({
    description: '阅读速度',
    required: false,
    example: 'slow',
  })
  @IsOptional()
  @IsString()
  readingSpeed?: string;
}

export class LexileResponseDto {
  @ApiProperty({
    description: 'Lexile 值',
    example: 650,
  })
  lexile: number;

  @ApiProperty({
    description: '信心度 (0-100)',
    example: 85,
  })
  confidence: number;

  @ApiProperty({
    description: '等级',
    example: 'intermediate',
  })
  level: LexileLevel;

  @ApiProperty({
    description: '建议',
    example: '建议阅读 600-700L 的书籍，适合初级到中级水平',
  })
  recommendation: string;
}

export class UserLexileDto {
  @ApiProperty({
    description: '用户 ID',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Lexile 值',
    example: 650,
  })
  lexile: number;

  @ApiProperty({
    description: '评估方式',
    example: 'ai_assessment',
  })
  assessmentMethod: string;

  @ApiProperty({
    description: '评估时间',
    example: '2025-10-27T10:00:00.000Z',
  })
  assessedAt: Date;
}

export class BookRecommendationDto {
  @ApiProperty({
    description: '书籍 ID',
    example: 'book-123',
  })
  bookId: string;

  @ApiProperty({
    description: '推荐版本',
    example: 'simplified',
  })
  recommendedVersion: string;

  @ApiProperty({
    description: '推荐理由',
    example: '基于您的 Lexile 水平 650L，推荐简化版本',
  })
  reason: string;

  @ApiProperty({
    description: '难度匹配度 (0-100)',
    example: 85,
  })
  matchScore: number;
}

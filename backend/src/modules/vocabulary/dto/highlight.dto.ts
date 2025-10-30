import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';

export enum HighlightMode {
  ALL = 'all',
  DIFFICULT = 'difficult',
  UNKNOWN = 'unknown',
  CUSTOM = 'custom',
}

export class HighlightConfigDto {
  @ApiProperty({
    description: '用户Lexile水平',
    example: 750,
    minimum: 200,
    maximum: 1700,
  })
  @IsNumber()
  @Min(200)
  @Max(1700)
  userLexile: number;

  @ApiProperty({
    enum: HighlightMode,
    description: '高亮模式',
    example: HighlightMode.DIFFICULT,
  })
  @IsEnum(HighlightMode)
  highlightMode: HighlightMode;

  @ApiProperty({
    description: '自定义阈值（仅当highlightMode为custom时使用）',
    example: 800,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(1700)
  customThreshold?: number;

  @ApiProperty({
    description: '是否显示工具提示',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  showTooltips?: boolean = true;
}

export class AnalyzeTextDto {
  @ApiProperty({
    description: '要分析的文本内容',
    example: 'The quick brown fox jumps over the lazy dog.',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: '高亮配置',
    type: HighlightConfigDto,
  })
  config: HighlightConfigDto;
}

export class HighlightResultDto {
  @ApiProperty({ description: '单词', example: 'quick' })
  word: string;

  @ApiProperty({
    enum: ['easy', 'intermediate', 'advanced', 'expert'],
    description: '难度等级',
    example: 'intermediate',
  })
  difficulty: string;

  @ApiProperty({ description: '是否应该高亮', example: true })
  shouldHighlight: boolean;

  @ApiProperty({ description: '高亮颜色', example: '#ffeb3b' })
  highlightColor: string;

  @ApiProperty({ description: '工具提示文本', example: '中等 (600L) - 适合您的水平' })
  tooltip: string;

  @ApiProperty({ description: 'Lexile等级', example: 600 })
  lexileLevel: number;
}

export class AnalyzeTextResponseDto {
  @ApiProperty({
    description: '高亮结果列表',
    type: [HighlightResultDto],
  })
  results: HighlightResultDto[];

  @ApiProperty({ description: '分析统计', example: { totalWords: 9, highlightedWords: 3 } })
  stats: {
    totalWords: number;
    highlightedWords: number;
    easyWords: number;
    intermediateWords: number;
    advancedWords: number;
    expertWords: number;
  };
}

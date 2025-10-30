import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * 添加生词 DTO
 */
export class AddVocabularyDto {
  @ApiProperty({
    description: '单词',
    example: 'beautiful',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  word: string;

  @ApiProperty({
    description: '音标',
    example: '/ˈbjuːtɪfl/',
    required: false,
  })
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiProperty({
    description: '词性',
    example: 'adjective',
    required: false,
  })
  @IsString()
  @IsOptional()
  partOfSpeech?: string;

  @ApiProperty({
    description: '英文释义',
    example: 'pleasing the senses or mind aesthetically',
    required: false,
  })
  @IsString()
  @IsOptional()
  englishDefinition?: string;

  @ApiProperty({
    description: '中文翻译',
    example: '美丽的，漂亮的',
  })
  @IsString()
  chineseTranslation: string;

  @ApiProperty({
    description: '例句',
    example: 'She has a beautiful smile.',
    required: false,
  })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiProperty({
    description: '例句翻译',
    example: '她有一个美丽的笑容。',
    required: false,
  })
  @IsString()
  @IsOptional()
  exampleTranslation?: string;

  @ApiProperty({
    description: '单词的蓝斯值水平',
    example: 800,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  lexileLevel?: number;

  @ApiProperty({
    description: '来源类型',
    enum: ['chapter', 'listening'],
    required: false,
  })
  @IsEnum(['chapter', 'listening'])
  @IsOptional()
  sourceType?: string;

  @ApiProperty({
    description: '来源章节ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  sourceChapterId?: string;

  @ApiProperty({
    description: '来源听力ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  sourceListeningId?: string;

  @ApiProperty({
    description: '用户自定义笔记',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 更新生词 DTO
 */
export class UpdateVocabularyDto {
  @ApiProperty({
    description: '是否已掌握',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  mastered?: boolean;

  @ApiProperty({
    description: '用户自定义笔记',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * 查询生词本 DTO
 */
export class QueryVocabularyDto {
  @ApiProperty({
    description: '页码',
    default: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    default: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    description: '是否已掌握（筛选）',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  mastered?: boolean;

  @ApiProperty({
    description: '搜索关键词（单词或翻译）',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: '来源类型筛选',
    enum: ['chapter', 'listening'],
    required: false,
  })
  @IsEnum(['chapter', 'listening'])
  @IsOptional()
  sourceType?: string;
}

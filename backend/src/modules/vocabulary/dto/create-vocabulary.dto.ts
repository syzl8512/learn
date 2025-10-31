import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * 单词来源类型枚举
 */
export enum SourceType {
  CHAPTER = 'chapter',
  LISTENING = 'listening',
  MANUAL = 'manual',
}

/**
 * 词性枚举
 */
export enum PartOfSpeech {
  NOUN = 'noun', // 名词
  VERB = 'verb', // 动词
  ADJECTIVE = 'adjective', // 形容词
  ADVERB = 'adverb', // 副词
  PRONOUN = 'pronoun', // 代词
  PREPOSITION = 'preposition', // 介词
  CONJUNCTION = 'conjunction', // 连词
  INTERJECTION = 'interjection', // 感叹词
  OTHER = 'other', // 其他
}

/**
 * 创建生词DTO
 */
export class CreateVocabularyDto {
  @ApiProperty({
    description: '单词',
    example: 'abandon',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  word: string;

  @ApiProperty({
    description: '中文翻译',
    example: '放弃; 抛弃',
  })
  @IsString()
  @IsNotEmpty()
  chineseTranslation: string;

  @ApiPropertyOptional({
    description: '音标',
    example: '/əˈbændən/',
  })
  @IsString()
  @IsOptional()
  pronunciation?: string;

  @ApiPropertyOptional({
    description: '词性',
    enum: PartOfSpeech,
    example: PartOfSpeech.VERB,
  })
  @IsEnum(PartOfSpeech)
  @IsOptional()
  partOfSpeech?: PartOfSpeech;

  @ApiPropertyOptional({
    description: '英文释义',
    example:
      'to leave somebody, especially somebody you are responsible for, with no intention of returning',
  })
  @IsString()
  @IsOptional()
  englishDefinition?: string;

  @ApiPropertyOptional({
    description: '例句',
    example: 'The baby had been abandoned by its mother.',
  })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiPropertyOptional({
    description: '例句翻译',
    example: '这个婴儿被母亲遗弃了。',
  })
  @IsString()
  @IsOptional()
  exampleTranslation?: string;

  // 移除了同义词、反义词和蓝斯值字段，因为数据库模型中已删除这些字段
  // 这些字段现在不再支持
  // synonyms?: string[];
  // antonyms?: string[];
  // lexileLevel?: number;

  @ApiPropertyOptional({
    description: '来源类型',
    enum: SourceType,
    example: SourceType.CHAPTER,
  })
  @IsEnum(SourceType)
  @IsOptional()
  sourceType?: SourceType;

  @ApiPropertyOptional({
    description: '来源章节ID (当sourceType为chapter时)',
    example: 'clx1234567890',
  })
  @IsString()
  @IsOptional()
  sourceChapterId?: string;

  @ApiPropertyOptional({
    description: '来源听力ID (当sourceType为listening时)',
    example: 'clx9876543210',
  })
  @IsString()
  @IsOptional()
  sourceListeningId?: string;

  @ApiPropertyOptional({
    description: '用户自定义笔记',
    example: '这个单词在小说第三章出现过',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

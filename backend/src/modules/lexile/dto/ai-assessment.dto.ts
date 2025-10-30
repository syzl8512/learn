import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class AiAssessmentDto {
  @ApiProperty({
    description: '单词列表（用于 AI 评估）',
    example: ['apple', 'banana', 'computer', 'education'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(5, { message: '至少需要提供 5 个单词进行评估' })
  @IsString({ each: true })
  wordList: string[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * 词义查询 DTO
 */
export class LookupWordDto {
  @ApiProperty({
    description: '要查询的单词',
    example: 'beautiful',
  })
  @IsString()
  @IsNotEmpty({ message: '单词不能为空' })
  @MinLength(1, { message: '单词至少需要1个字符' })
  @MaxLength(50, { message: '单词不能超过50个字符' })
  word: string;
}

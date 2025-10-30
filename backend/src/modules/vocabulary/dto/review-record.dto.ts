import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

/**
 * 记录复习DTO
 */
export class ReviewRecordDto {
  @ApiProperty({
    description: '复习是否正确',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  correct?: boolean;

  @ApiProperty({
    description: '复习用时（秒）',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @ApiProperty({
    description: '备注',
    example: '记住了这个单词的用法',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

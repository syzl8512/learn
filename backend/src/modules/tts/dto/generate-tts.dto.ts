import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class GenerateTtsDto {
  @ApiPropertyOptional({
    description: '章节版本',
    enum: ['original', 'easy', 'ket', 'pet', 'custom'],
    default: 'original',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: '语音类型',
    default: 'default',
  })
  @IsOptional()
  @IsString()
  voice?: string;

  @ApiPropertyOptional({
    description: '语速（0.5 - 2.0）',
    minimum: 0.5,
    maximum: 2.0,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  speed?: number;
}

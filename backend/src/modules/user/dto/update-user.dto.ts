import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '蓝斯值', minimum: 200, maximum: 1700 })
  @IsOptional()
  @IsNumber()
  @Min(200)
  @Max(1700)
  lexileScore?: number;

  @ApiPropertyOptional({
    description: '蓝斯值等级',
    enum: ['初级', 'KET', 'PET', '自定义'],
  })
  @IsOptional()
  @IsString()
  lexileLevel?: string;
}

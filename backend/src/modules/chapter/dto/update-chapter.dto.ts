import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class UpdateChapterDto {
  @ApiPropertyOptional({ description: '章节标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '章节序号' })
  @IsOptional()
  @IsInt()
  @Min(1)
  sequenceNumber?: number;

  @ApiPropertyOptional({ description: '音频URL' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ description: '音频是否已生成' })
  @IsOptional()
  @IsBoolean()
  audioGenerated?: boolean;

  @ApiPropertyOptional({
    description: '状态',
    enum: ['draft', 'processing', 'published'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}

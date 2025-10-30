import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class CreateBookmarkDto {
  @ApiProperty({ description: '书签位置（字符偏移量）' })
  @IsInt()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ description: '书签备注' })
  @IsOptional()
  @IsString()
  note?: string;
}

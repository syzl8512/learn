import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateChapterDto {
  @ApiProperty({ description: '书籍ID' })
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({ description: '章节序号' })
  @IsInt()
  @Min(1)
  sequenceNumber: number;

  @ApiProperty({ description: '章节标题' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

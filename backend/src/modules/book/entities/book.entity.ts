import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 书籍实体
 */
export class BookEntity {
  @ApiProperty({
    description: '书籍 ID',
    example: 'clxxxx123456',
  })
  id: string;

  @ApiProperty({
    description: '书籍标题',
    example: 'The Great Gatsby',
  })
  title: string;

  @ApiPropertyOptional({
    description: '作者',
    example: 'F. Scott Fitzgerald',
  })
  author?: string;

  @ApiPropertyOptional({
    description: '书籍描述',
    example: 'A classic American novel about the American Dream.',
  })
  description?: string;

  @ApiPropertyOptional({
    description: '封面图片 URL',
    example: 'https://example.com/covers/great-gatsby.jpg',
  })
  coverUrl?: string;

  @ApiPropertyOptional({
    description: '原书蓝斯值',
    example: 1070,
  })
  originalLexile?: number;

  @ApiPropertyOptional({
    description: '蓝斯值范围',
    example: '1000-1200L',
  })
  lexileRange?: string;

  @ApiPropertyOptional({
    description: '书籍分类',
    example: '小说',
  })
  category?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    example: ['经典', '美国文学', '20世纪'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: '推荐年龄',
    example: '15-18岁',
  })
  recommendedAge?: string;

  @ApiProperty({
    description: '书籍状态',
    example: 'published',
    enum: ['draft', 'processing', 'published', 'archived'],
  })
  status: string;

  @ApiPropertyOptional({
    description: '发布时间',
    example: '2025-10-26T10:00:00.000Z',
  })
  publishedAt?: Date;

  @ApiProperty({
    description: '创建时间',
    example: '2025-10-26T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2025-10-26T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: '章节数量',
    example: 12,
  })
  chaptersCount?: number;

  constructor(partial: Partial<BookEntity>) {
    Object.assign(this, partial);
  }
}

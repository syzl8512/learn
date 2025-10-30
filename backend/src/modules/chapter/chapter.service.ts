import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

/**
 * 章节服务
 * 提供章节和章节内容的管理功能
 */
@Injectable()
export class ChapterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建章节
   */
  async create(createChapterDto: CreateChapterDto) {
    const chapter = await this.prisma.chapter.create({
      data: {
        bookId: createChapterDto.bookId,
        sequenceNumber: createChapterDto.sequenceNumber,
        title: createChapterDto.title,
        status: 'draft',
      },
    });

    return chapter;
  }

  /**
   * 获取章节详情
   */
  async findOne(chapterId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    return chapter;
  }

  /**
   * 更新章节
   */
  async update(chapterId: string, updateChapterDto: UpdateChapterDto) {
    await this.findOne(chapterId);

    return await this.prisma.chapter.update({
      where: { id: chapterId },
      data: updateChapterDto,
    });
  }

  /**
   * 删除章节
   */
  async remove(chapterId: string) {
    await this.findOne(chapterId);

    await this.prisma.chapter.delete({
      where: { id: chapterId },
    });
  }

  /**
   * 获取章节内容（指定版本）
   */
  async getContent(chapterId: string, version: string = 'original') {
    const content = await this.prisma.chapterContent.findUnique({
      where: {
        chapterId_version: {
          chapterId,
          version,
        },
      },
    });

    if (!content) {
      throw new NotFoundException(`章节内容不存在（版本: ${version}）`);
    }

    return content;
  }

  /**
   * 获取章节的所有版本内容
   */
  async getAllVersions(chapterId: string) {
    const contents = await this.prisma.chapterContent.findMany({
      where: { chapterId },
      orderBy: { version: 'asc' },
    });

    return contents;
  }

  /**
   * 创建或更新章节内容
   */
  async upsertContent(
    chapterId: string,
    version: string,
    content: string,
    metadata?: {
      wordCount?: number;
      sentenceCount?: number;
      estimatedLexile?: number;
      estimatedReadingTime?: number;
    },
  ) {
    const chapterContent = await this.prisma.chapterContent.upsert({
      where: {
        chapterId_version: {
          chapterId,
          version,
        },
      },
      create: {
        chapterId,
        version,
        content,
        wordCount: metadata?.wordCount,
        sentenceCount: metadata?.sentenceCount,
        estimatedLexile: metadata?.estimatedLexile,
        estimatedReadingTime: metadata?.estimatedReadingTime,
        processedBy: 'ai',
        processedAt: new Date(),
      },
      update: {
        content,
        wordCount: metadata?.wordCount,
        sentenceCount: metadata?.sentenceCount,
        estimatedLexile: metadata?.estimatedLexile,
        estimatedReadingTime: metadata?.estimatedReadingTime,
        processedAt: new Date(),
      },
    });

    return chapterContent;
  }

  /**
   * 获取书籍的所有章节
   */
  async getBookChapters(bookId: string) {
    return await this.prisma.chapter.findMany({
      where: { bookId },
      orderBy: { sequenceNumber: 'asc' },
      select: {
        id: true,
        title: true,
        sequenceNumber: true,
        status: true,
        audioUrl: true,
        audioGenerated: true,
        createdAt: true,
      },
    });
  }
}

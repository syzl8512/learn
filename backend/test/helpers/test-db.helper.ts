/**
 * 测试数据库辅助工具
 * 用于创建和清理测试数据库
 */

import { PrismaClient } from '@prisma/client';

export class TestDbHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  /**
   * 清空所有表数据
   */
  async cleanDatabase(): Promise<void> {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * 获取 Prisma 客户端实例
   */
  getPrisma(): PrismaClient {
    return this.prisma;
  }

  /**
   * 创建测试用户
   */
  async createTestUser(overrides?: Partial<any>) {
    return this.prisma.user.create({
      data: {
        email: 'test@example.com',
        nickname: 'Test User',
        lexileScore: 800,
        lexileLevel: 'KET',
        ...overrides,
      },
    });
  }

  /**
   * 创建测试书籍
   */
  async createTestBook(overrides?: Partial<any>) {
    return this.prisma.book.create({
      data: {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        originalLexile: 800,
        status: 'published',
        ...overrides,
      },
    });
  }

  /**
   * 创建测试章节
   */
  async createTestChapter(bookId: string, overrides?: Partial<any>) {
    return this.prisma.chapter.create({
      data: {
        bookId,
        sequenceNumber: 1,
        title: 'Test Chapter',
        status: 'published',
        ...overrides,
      },
    });
  }

  /**
   * 创建测试章节内容
   */
  async createTestChapterContent(
    chapterId: string,
    version: string = 'original',
    overrides?: Partial<any>,
  ) {
    return this.prisma.chapterContent.create({
      data: {
        chapterId,
        version,
        content: 'Test content for chapter',
        wordCount: 100,
        sentenceCount: 10,
        ...overrides,
      },
    });
  }

  /**
   * 创建测试生词
   */
  async createTestVocabulary(userId: string, overrides?: Partial<any>) {
    return this.prisma.vocabulary.create({
      data: {
        userId,
        word: 'test',
        chineseTranslation: '测试',
        ...overrides,
      },
    });
  }
}

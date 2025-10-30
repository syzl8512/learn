import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';

describe('Book Flow E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prismaService = app.get<PrismaService>(PrismaService);
    await app.init();

    // 创建测试用户并登录
    const testUser = {
      email: 'test-book-e2e@example.com',
      password: 'Test123!@#',
      username: 'test-book-user',
    };

    await prismaService.user.deleteMany({
      where: { email: testUser.email },
    });

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(testUser);

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    accessToken = loginRes.body.access_token;
    userId = loginRes.body.user.id;
  });

  afterAll(async () => {
    // 清理测试数据
    await prismaService.userVocabulary.deleteMany({
      where: { userId },
    });
    await prismaService.readingProgress.deleteMany({
      where: { userId },
    });
    await prismaService.chapter.deleteMany({
      where: {
        book: {
          title: {
            contains: 'Test Book E2E',
          },
        },
      },
    });
    await prismaService.book.deleteMany({
      where: {
        title: {
          contains: 'Test Book E2E',
        },
      },
    });
    await prismaService.user.delete({
      where: { id: userId },
    });

    await app.close();
  });

  describe('书籍上传流程', () => {
    it('应该支持创建书籍（不上传 PDF）', async () => {
      const createBookDto = {
        title: 'Test Book E2E - Manual',
        author: 'Test Author',
        originalLexile: 800,
        description: 'A test book for E2E testing',
        cover: 'https://example.com/cover.jpg',
      };

      const res = await request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createBookDto)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(createBookDto.title);
      expect(res.body.status).toBe('draft');
    });

    it('应该验证必填字段', () => {
      return request(app.getHttpServer())
        .post('/api/books')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // 缺少 title 和 author
          originalLexile: 800,
        })
        .expect(400);
    });

    // 注意：实际 PDF 上传需要真实的 PDF 文件
    // 这里只演示接口结构
    it.skip('应该上传 PDF 并创建处理任务', async () => {
      // 需要用户提供真实的测试 PDF 文件
      const testPdfPath = path.join(__dirname, '../test-files/sample.pdf');

      if (!fs.existsSync(testPdfPath)) {
        console.log('跳过 PDF 上传测试：未找到测试 PDF 文件');
        return;
      }

      const res = await request(app.getHttpServer())
        .post('/api/books/upload')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', testPdfPath)
        .field('title', 'Test Book E2E - PDF Upload')
        .field('author', 'Test Author')
        .field('originalLexile', '800')
        .expect(201);

      expect(res.body).toHaveProperty('bookId');
      expect(res.body).toHaveProperty('jobId');
      expect(res.body.status).toBe('queued');
    });
  });

  describe('书籍查询流程', () => {
    let bookId: string;

    beforeAll(async () => {
      // 创建测试书籍
      const book = await prismaService.book.create({
        data: {
          title: 'Test Book E2E - Query',
          author: 'Test Author',
          originalLexile: 800,
          status: 'published',
        },
      });
      bookId = book.id;
    });

    it('应该获取书籍列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/books')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应该支持分页', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/books?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
    });

    it('应该支持按 Lexile 筛选', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/books?minLexile=600&maxLexile=900')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 验证返回的书籍都在范围内
      res.body.data.forEach((book: any) => {
        if (book.originalLexile) {
          expect(book.originalLexile).toBeGreaterThanOrEqual(600);
          expect(book.originalLexile).toBeLessThanOrEqual(900);
        }
      });
    });

    it('应该支持搜索', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/books?search=Query')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 搜索结果应该包含关键词
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('应该获取单个书籍详情', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/books/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(bookId);
      expect(res.body.title).toContain('Query');
    });

    it('获取不存在的书籍应该返回 404', () => {
      return request(app.getHttpServer())
        .get('/api/books/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('章节查询流程', () => {
    let bookId: string;
    let chapterId: string;

    beforeAll(async () => {
      // 创建测试书籍和章节
      const book = await prismaService.book.create({
        data: {
          title: 'Test Book E2E - Chapters',
          author: 'Test Author',
          originalLexile: 800,
          status: 'published',
        },
      });
      bookId = book.id;

      const chapter = await prismaService.chapter.create({
        data: {
          bookId,
          title: 'Chapter 1',
          chapterNumber: 1,
          content: 'This is test chapter content.',
          wordCount: 5,
          sentenceCount: 1,
          version: 'original',
        },
      });
      chapterId = chapter.id;
    });

    it('应该获取书籍的章节列表', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/books/${bookId}/chapters`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('chapterNumber');
    });

    it('应该按章节号排序', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/books/${bookId}/chapters`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      for (let i = 1; i < res.body.length; i++) {
        expect(res.body[i].chapterNumber).toBeGreaterThanOrEqual(
          res.body[i - 1].chapterNumber,
        );
      }
    });

    it('应该获取单个章节内容', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(chapterId);
      expect(res.body).toHaveProperty('content');
      expect(res.body).toHaveProperty('wordCount');
    });

    it('应该支持版本查询', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/chapters/${chapterId}?version=original`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.version).toBe('original');
    });
  });

  describe('完整阅读流程', () => {
    let bookId: string;
    let chapterId: string;

    beforeAll(async () => {
      // 创建完整的测试数据
      const book = await prismaService.book.create({
        data: {
          title: 'Test Book E2E - Reading Flow',
          author: 'Test Author',
          originalLexile: 800,
          status: 'published',
        },
      });
      bookId = book.id;

      const chapter = await prismaService.chapter.create({
        data: {
          bookId,
          title: 'Chapter 1: The Beginning',
          chapterNumber: 1,
          content: 'Once upon a time, there was a magical world.',
          wordCount: 9,
          sentenceCount: 1,
          version: 'original',
        },
      });
      chapterId = chapter.id;
    });

    it('应该完成 查找书籍 → 获取章节 → 保存进度 → 查询进度 流程', async () => {
      // 1. 查找书籍
      const booksRes = await request(app.getHttpServer())
        .get('/api/books?search=Reading Flow')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(booksRes.body.data.length).toBeGreaterThan(0);
      const foundBook = booksRes.body.data[0];

      // 2. 获取书籍详情
      const bookRes = await request(app.getHttpServer())
        .get(`/api/books/${foundBook.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(bookRes.body.id).toBe(bookId);

      // 3. 获取章节列表
      const chaptersRes = await request(app.getHttpServer())
        .get(`/api/books/${bookId}/chapters`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(chaptersRes.body.length).toBeGreaterThan(0);

      // 4. 获取章节内容
      const chapterRes = await request(app.getHttpServer())
        .get(`/api/chapters/${chapterId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(chapterRes.body.content).toBeDefined();

      // 5. 保存阅读进度
      const progressRes = await request(app.getHttpServer())
        .post(`/api/chapters/${chapterId}/progress`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          progress: 50,
          lastPosition: 500,
        })
        .expect(201);

      expect(progressRes.body.progress).toBe(50);

      // 6. 查询进度
      const getProgressRes = await request(app.getHttpServer())
        .get(`/api/progress/user/${userId}/book/${bookId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(getProgressRes.body).toBeDefined();
    });
  });
});


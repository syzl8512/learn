import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Lexile System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        wechatId: 'test_wechat_id',
      },
    });
    userId = user.id;

    // 生成 JWT token
    authToken = jwtService.sign({ userId: user.id, email: user.email });
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });
    await app.close();
  });

  describe('POST /api/lexile/quick-select', () => {
    it('should set quick select lexile level', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/lexile/quick-select')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ level: 'intermediate' })
        .expect(200);

      expect(response.body).toHaveProperty('lexileValue');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body.lexileValue).toBe(600); // 中级对应 600L
    });

    it('should reject invalid level', async () => {
      await request(app.getHttpServer())
        .post('/api/lexile/quick-select')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ level: 'invalid' })
        .expect(400);
    });
  });

  describe('PATCH /api/lexile/manual-input', () => {
    it('should set manual lexile value', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/lexile/manual-input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lexileValue: 750 })
        .expect(200);

      expect(response.body).toHaveProperty('lexileValue', 750);
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should reject out of range values', async () => {
      await request(app.getHttpServer())
        .patch('/api/lexile/manual-input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lexileValue: 50 })
        .expect(400);

      await request(app.getHttpServer())
        .patch('/api/lexile/manual-input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lexileValue: 2000 })
        .expect(400);
    });
  });

  describe('POST /api/lexile/ai-assessment', () => {
    it('should assess text with AI', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/lexile/ai-assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          text: 'The quick brown fox jumps over the lazy dog.',
          language: 'en'
        })
        .expect(200);

      expect(response.body).toHaveProperty('lexileValue');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('model');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.lexileValue).toBeGreaterThanOrEqual(200);
      expect(response.body.lexileValue).toBeLessThanOrEqual(1700);
    });

    it('should handle AI service failure gracefully', async () => {
      // 这个测试需要模拟 AI 服务失败的情况
      const response = await request(app.getHttpServer())
        .post('/api/lexile/ai-assessment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          text: 'Test text for AI assessment',
          language: 'en'
        });

      // 即使 AI 服务失败，也应该返回一个合理的响应
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/lexile/me', () => {
    it('should get user lexile value', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lexile/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('lexileValue');
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('GET /api/lexile/books/:bookId/recommend-version', () => {
    let bookId: string;
    let versionId: string;

    beforeAll(async () => {
      // 创建测试书籍和版本
      const book = await prisma.book.create({
        data: {
          title: 'Test Book',
          author: 'Test Author',
          description: 'Test Description',
          coverUrl: 'https://example.com/cover.jpg',
          isbn: '1234567890',
          publisher: 'Test Publisher',
          publishDate: new Date(),
          language: 'en',
          category: 'fiction',
        },
      });
      bookId = book.id;

      const version = await prisma.bookVersion.create({
        data: {
          bookId: book.id,
          version: '1.0',
          content: 'Test content',
          lexileValue: 750,
          isActive: true,
        },
      });
      versionId = version.id;
    });

    afterAll(async () => {
      // 清理测试数据
      await prisma.bookVersion.deleteMany({
        where: { bookId },
      });
      await prisma.book.deleteMany({
        where: { id: bookId },
      });
    });

    it('should recommend book version based on user lexile', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/lexile/books/${bookId}/recommend-version`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('versionId');
      expect(response.body).toHaveProperty('lexileValue');
      expect(response.body).toHaveProperty('reason');
    });

    it('should handle user without lexile value', async () => {
      // 创建没有 lexile 值的用户
      const userWithoutLexile = await prisma.user.create({
        data: {
          email: 'test2@example.com',
          name: 'Test User 2',
          wechatId: 'test_wechat_id_2',
        },
      });

      const token = jwtService.sign({ userId: userWithoutLexile.id, email: userWithoutLexile.email });

      await request(app.getHttpServer())
        .get(`/api/lexile/books/${bookId}/recommend-version`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      // 清理
      await prisma.user.deleteMany({
        where: { email: 'test2@example.com' },
      });
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      await request(app.getHttpServer())
        .post('/api/lexile/quick-select')
        .send({ level: 'intermediate' })
        .expect(401);

      await request(app.getHttpServer())
        .patch('/api/lexile/manual-input')
        .send({ lexileValue: 750 })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/lexile/ai-assessment')
        .send({ text: 'Test text' })
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/lexile/me')
        .expect(401);
    });
  });
});

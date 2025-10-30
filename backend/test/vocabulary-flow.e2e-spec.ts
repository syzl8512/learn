import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';

describe('Vocabulary Flow E2E Tests', () => {
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
      email: 'test-vocab-e2e@example.com',
      password: 'Test123!@#',
      username: 'test-vocab-user',
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
    await prismaService.user.delete({
      where: { id: userId },
    });

    await app.close();
  });

  describe('单词查询', () => {
    it('应该成功查询单词', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          word: 'apple',
        })
        .expect(201);

      expect(res.body).toHaveProperty('word');
      expect(res.body).toHaveProperty('definition');
      expect(res.body.word).toBe('apple');
    });

    it('应该标准化单词（小写、去空格）', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          word: '  APPLE  ',
        })
        .expect(201);

      expect(res.body.word).toBe('apple');
    });

    it('应该拒绝空单词', () => {
      return request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          word: '',
        })
        .expect(400);
    });

    it('查询过的单词应该被缓存', async () => {
      const word = 'test-cached-word';

      // 第一次查询
      const res1 = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ word })
        .expect(201);

      // 第二次查询（应该从缓存获取）
      const res2 = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ word })
        .expect(201);

      expect(res2.body.word).toBe(word);
      // 两次查询应该返回相同的 ID（表示来自缓存）
      expect(res2.body.id).toBe(res1.body.id);
    });
  });

  describe('生词本管理', () => {
    let vocabularyId: string;

    beforeAll(async () => {
      // 创建一个测试单词
      const lookupRes = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          word: 'vocabulary-test',
        });

      vocabularyId = lookupRes.body.id;
    });

    it('应该添加单词到生词本', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/vocabulary/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          vocabularyId,
          notes: 'My test note',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.vocabularyId).toBe(vocabularyId);
      expect(res.body.notes).toBe('My test note');
    });

    it('应该防止重复添加', async () => {
      // 第一次添加
      await request(app.getHttpServer())
        .post('/api/vocabulary/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          vocabularyId,
        })
        .expect(201);

      // 第二次添加应该失败
      await request(app.getHttpServer())
        .post('/api/vocabulary/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          vocabularyId,
        })
        .expect(400);
    });

    it('应该获取生词本列表', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vocabulary/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('应该支持分页', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vocabulary/my?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
    });

    it('应该按状态筛选', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vocabulary/my?status=LEARNING')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      res.body.data.forEach((item: any) => {
        expect(item.status).toBe('LEARNING');
      });
    });

    it('应该支持搜索', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vocabulary/my?search=test')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('生词本操作', () => {
    let userVocabId: string;

    beforeAll(async () => {
      // 创建测试单词并添加到生词本
      const lookupRes = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          word: 'update-test-word',
        });

      const addRes = await request(app.getHttpServer())
        .post('/api/vocabulary/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          vocabularyId: lookupRes.body.id,
          notes: 'Original note',
        });

      userVocabId = addRes.body.id;
    });

    it('应该更新生词本条目', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notes: 'Updated note',
          status: 'REVIEWING',
        })
        .expect(200);

      expect(res.body.notes).toBe('Updated note');
      expect(res.body.status).toBe('REVIEWING');
    });

    it('应该获取单个生词', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(userVocabId);
    });

    it('应该删除生词本条目', async () => {
      await request(app.getHttpServer())
        .delete(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 验证已删除
      await request(app.getHttpServer())
        .get(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('不应该删除其他用户的生词', async () => {
      // 创建另一个用户
      const otherUser = {
        email: 'other-user@example.com',
        password: 'Test123!@#',
        username: 'other-user',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(otherUser);

      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: otherUser.email,
          password: otherUser.password,
        });

      const otherToken = loginRes.body.access_token;

      // 尝试删除第一个用户的生词
      await request(app.getHttpServer())
        .delete(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404); // 应该返回 404 或 403
    });
  });

  describe('复习功能', () => {
    let userVocabId: string;

    beforeAll(async () => {
      // 创建需要复习的单词
      const lookupRes = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          word: 'review-test-word',
        });

      const addRes = await request(app.getHttpServer())
        .post('/api/vocabulary/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          vocabularyId: lookupRes.body.id,
        });

      userVocabId = addRes.body.id;
    });

    it('应该获取需要复习的单词', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vocabulary/review')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('应该记录复习结果', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/vocabulary/my/${userVocabId}/review`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          difficulty: 'EASY',
          isCorrect: true,
        })
        .expect(201);

      expect(res.body.reviewCount).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('nextReviewAt');
    });

    it('正确答案应该增加 correctCount', async () => {
      const beforeRes = await request(app.getHttpServer())
        .get(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      const beforeCount = beforeRes.body.correctCount || 0;

      await request(app.getHttpServer())
        .post(`/api/vocabulary/my/${userVocabId}/review`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          difficulty: 'EASY',
          isCorrect: true,
        })
        .expect(201);

      const afterRes = await request(app.getHttpServer())
        .get(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(afterRes.body.correctCount).toBe(beforeCount + 1);
    });
  });

  describe('完整词汇流程', () => {
    it('应该完成 查词 → 添加生词本 → 复习 → 掌握 流程', async () => {
      // 1. 查询单词
      const lookupRes = await request(app.getHttpServer())
        .post('/api/vocabulary/lookup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          word: 'complete-flow',
        })
        .expect(201);

      const vocabularyId = lookupRes.body.id;
      expect(lookupRes.body.word).toBe('complete-flow');

      // 2. 添加到生词本
      const addRes = await request(app.getHttpServer())
        .post('/api/vocabulary/my')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          vocabularyId,
          notes: 'Learning this word',
        })
        .expect(201);

      const userVocabId = addRes.body.id;
      expect(addRes.body.status).toBe('LEARNING');

      // 3. 第一次复习（困难）
      await request(app.getHttpServer())
        .post(`/api/vocabulary/my/${userVocabId}/review`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          difficulty: 'HARD',
          isCorrect: false,
        })
        .expect(201);

      // 4. 第二次复习（一般）
      await request(app.getHttpServer())
        .post(`/api/vocabulary/my/${userVocabId}/review`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          difficulty: 'MEDIUM',
          isCorrect: true,
        })
        .expect(201);

      // 5. 第三次复习（容易）
      const review3Res = await request(app.getHttpServer())
        .post(`/api/vocabulary/my/${userVocabId}/review`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          difficulty: 'EASY',
          isCorrect: true,
        })
        .expect(201);

      expect(review3Res.body.reviewCount).toBe(3);

      // 6. 更新状态为掌握
      const masterRes = await request(app.getHttpServer())
        .patch(`/api/vocabulary/my/${userVocabId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'MASTERED',
        })
        .expect(200);

      expect(masterRes.body.status).toBe('MASTERED');

      // 7. 查看统计
      const statsRes = await request(app.getHttpServer())
        .get('/api/vocabulary/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(statsRes.body).toHaveProperty('total');
      expect(statsRes.body).toHaveProperty('mastered');
      expect(statsRes.body.mastered).toBeGreaterThan(0);
    });
  });

  describe('生词本统计', () => {
    it('应该返回正确的统计信息', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vocabulary/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('learning');
      expect(res.body).toHaveProperty('reviewing');
      expect(res.body).toHaveProperty('mastered');
      expect(typeof res.body.total).toBe('number');
    });
  });
});


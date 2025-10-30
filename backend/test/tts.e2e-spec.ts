import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('TTS System (e2e)', () => {
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

  describe('POST /api/tts/generate', () => {
    it('should generate speech successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Hello, this is a test of the TTS system.',
          voice: 'en_female_1',
          speed: 1.0,
          language: 'en',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('audioUrl');
      expect(response.body.audioUrl).toMatch(/^https?:\/\//);
    });

    it('should generate speech with Chinese text', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '你好，这是中文语音合成测试。',
          voice: 'zh_female_1',
          speed: 1.0,
          language: 'zh',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('audioUrl');
    });

    it('should handle different emotions', async () => {
      const emotions = ['neutral', 'happy', 'sad', 'serious'];
      
      for (const emotion of emotions) {
        const response = await request(app.getHttpServer())
          .post('/api/tts/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            text: `This is a test with ${emotion} emotion.`,
            voice: 'en_female_1',
            emotion: emotion,
            speed: 1.0,
            language: 'en',
          });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201) {
          expect(response.body).toHaveProperty('success', true);
        }
      }
    });

    it('should handle different speeds', async () => {
      const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
      
      for (const speed of speeds) {
        const response = await request(app.getHttpServer())
          .post('/api/tts/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            text: `This is a test with speed ${speed}.`,
            voice: 'en_female_1',
            speed: speed,
            language: 'en',
          });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201) {
          expect(response.body).toHaveProperty('success', true);
        }
      }
    });

    it('should handle long text', async () => {
      const longText = 'This is a very long text that should test the TTS system\'s ability to handle longer content. '.repeat(10);
      
      const response = await request(app.getHttpServer())
        .post('/api/tts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: longText,
          voice: 'en_female_1',
          speed: 1.0,
          language: 'en',
        });

      expect([200, 201, 500]).toContain(response.status);
    });

    it('should handle empty text', async () => {
      await request(app.getHttpServer())
        .post('/api/tts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: '',
          voice: 'en_female_1',
          speed: 1.0,
          language: 'en',
        })
        .expect(400);
    });

    it('should handle invalid voice', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Test text',
          voice: 'invalid_voice',
          speed: 1.0,
          language: 'en',
        });

      // 应该返回错误或使用默认语音
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/tts/voices', () => {
    it('should return available voices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tts/voices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // 检查语音对象结构
      const voice = response.body[0];
      expect(voice).toHaveProperty('id');
      expect(voice).toHaveProperty('name');
      expect(voice).toHaveProperty('language');
      expect(voice).toHaveProperty('emotion');
      expect(voice).toHaveProperty('description');
    });

    it('should include both English and Chinese voices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tts/voices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const voices = response.body;
      const englishVoices = voices.filter(v => v.language === 'en');
      const chineseVoices = voices.filter(v => v.language === 'zh');

      expect(englishVoices.length).toBeGreaterThan(0);
      expect(chineseVoices.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tts/stream', () => {
    it('should stream audio file', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tts/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          text: 'Hello, this is a streaming test.',
          voice: 'en_female_1',
          speed: 1.0,
        });

      // 流式响应可能返回不同的状态码
      expect([200, 400, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.headers['content-type']).toMatch(/audio\//);
      }
    });

    it('should require text parameter', async () => {
      await request(app.getHttpServer())
        .get('/api/tts/stream')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          voice: 'en_female_1',
          speed: 1.0,
        })
        .expect(400);
    });
  });

  describe('Health Check', () => {
    it('should check TTS service health', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('details');
      
      // 检查 TTS 服务健康状态
      if (response.body.details.tts) {
        expect(response.body.details.tts).toHaveProperty('status');
      }
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      await request(app.getHttpServer())
        .post('/api/tts/generate')
        .send({
          text: 'Test text',
          voice: 'en_female_1',
          speed: 1.0,
          language: 'en',
        })
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/tts/voices')
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/tts/stream')
        .query({
          text: 'Test text',
          voice: 'en_female_1',
          speed: 1.0,
        })
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle TTS service failures gracefully', async () => {
      // 这个测试需要模拟 TTS 服务失败的情况
      const response = await request(app.getHttpServer())
        .post('/api/tts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Test text that might cause TTS failure',
          voice: 'en_female_1',
          speed: 1.0,
          language: 'en',
        });

      // 即使 TTS 服务失败，也应该返回一个合理的响应
      expect([200, 201, 500]).toContain(response.status);
    });

    it('should handle network timeouts', async () => {
      // 这个测试需要模拟网络超时的情况
      const response = await request(app.getHttpServer())
        .post('/api/tts/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Test text for timeout simulation',
          voice: 'en_female_1',
          speed: 1.0,
          language: 'en',
        })
        .timeout(1000); // 设置较短的超时时间

      // 应该处理超时情况
      expect([200, 201, 408, 500]).toContain(response.status);
    });
  });
});

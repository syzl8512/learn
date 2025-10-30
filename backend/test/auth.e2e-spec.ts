import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await prismaService.user.deleteMany({
      where: {
        email: {
          contains: 'test-e2e',
        },
      },
    });
  });

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', () => {
      const registerDto = {
        email: 'test-e2e-user@example.com',
        password: 'Test123!@#',
        username: 'test-e2e-user',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(registerDto.email);
          expect(res.body.username).toBe(registerDto.username);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('应该拒绝重复的邮箱', async () => {
      const registerDto = {
        email: 'test-e2e-duplicate@example.com',
        password: 'Test123!@#',
        username: 'test-duplicate',
      };

      // 第一次注册
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      // 第二次注册应该失败
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409); // Conflict
    });

    it('应该验证邮箱格式', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#',
          username: 'testuser',
        })
        .expect(400); // Bad Request
    });

    it('应该验证密码强度', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test-e2e@example.com',
          password: '123', // 太短
          username: 'testuser',
        })
        .expect(400);
    });

    it('应该验证必填字段', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test-e2e@example.com',
          // 缺少 password 和 username
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      email: 'test-e2e-login@example.com',
      password: 'Test123!@#',
      username: 'test-login',
    };

    beforeEach(async () => {
      // 创建测试用户
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser);
    });

    it('应该成功登录并返回 JWT', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('应该拒绝错误的密码', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401); // Unauthorized
    });

    it('应该拒绝不存在的用户', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!@#',
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    let accessToken: string;
    const testUser = {
      email: 'test-e2e-profile@example.com',
      password: 'Test123!@#',
      username: 'test-profile',
    };

    beforeEach(async () => {
      // 注册并登录
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
    });

    it('应该返回当前用户信息', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.username).toBe(testUser.username);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('应该拒绝无 token 的请求', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('应该拒绝无效的 token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('完整认证流程', () => {
    it('应该完成 注册 → 登录 → 获取资料 → 更新资料 流程', async () => {
      const testUser = {
        email: 'test-e2e-flow@example.com',
        password: 'Test123!@#',
        username: 'test-flow',
      };

      // 1. 注册
      const registerRes = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerRes.body).toHaveProperty('id');
      const userId = registerRes.body.id;

      // 2. 登录
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginRes.body).toHaveProperty('access_token');
      const accessToken = loginRes.body.access_token;

      // 3. 获取个人资料
      const profileRes = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(profileRes.body.id).toBe(userId);
      expect(profileRes.body.email).toBe(testUser.email);

      // 4. 更新个人资料
      const updateRes = await request(app.getHttpServer())
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          lexileLevel: 800,
          preferences: {
            theme: 'dark',
            fontSize: 'large',
          },
        })
        .expect(200);

      expect(updateRes.body.lexileLevel).toBe(800);

      // 5. 验证更新后的资料
      const updatedProfileRes = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(updatedProfileRes.body.lexileLevel).toBe(800);
    });
  });
});


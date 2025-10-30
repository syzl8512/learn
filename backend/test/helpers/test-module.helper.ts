/**
 * 测试模块辅助工具
 * 用于创建 NestJS 测试模块
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * 创建测试应用
 */
export async function createTestingApp(
  moduleMetadata: any,
): Promise<INestApplication> {
  const moduleFixture: TestingModule =
    await Test.createTestingModule(moduleMetadata).compile();

  const app = moduleFixture.createNestApplication();

  // 应用全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * 创建测试模块
 */
export async function createTestingModule(
  moduleMetadata: any,
): Promise<TestingModule> {
  return Test.createTestingModule(moduleMetadata).compile();
}

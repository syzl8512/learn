/**
 * Jest 单元测试全局设置
 */

// 设置测试超时时间
jest.setTimeout(30000);

// 全局 Mock 环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/reading_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '7d';

// 清理定时器
afterAll(() => {
  jest.clearAllTimers();
});

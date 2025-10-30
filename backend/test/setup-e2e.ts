/**
 * Jest E2E 测试全局设置
 */

// 设置测试超时时间 (E2E 测试可能需要更长时间)
jest.setTimeout(60000);

// 全局 Mock 环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/reading_e2e_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '7d';
process.env.WECHAT_APP_ID = 'test-wechat-app-id';
process.env.WECHAT_APP_SECRET = 'test-wechat-app-secret';

// 清理定时器
afterAll(() => {
  jest.clearAllTimers();
});

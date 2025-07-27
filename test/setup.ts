import 'jest-extended';
import { config } from 'dotenv';
import { join } from 'path';

// 加载测试环境变量
config({ path: join(__dirname, '../.env.test') });

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  'test-jwt-secret-key-for-testing-purposes-only-32-chars';
process.env.JWT_REFRESH_SECRET =
  'test-jwt-refresh-secret-key-for-testing-purposes-only-32-chars';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '3306';
process.env.DB_USERNAME = process.env.TEST_DB_USERNAME || 'root';
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD || 'root';
process.env.DB_NAME = process.env.TEST_DB_NAME || 'test_db';
process.env.REDIS_HOST = process.env.TEST_REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.TEST_REDIS_PORT || '6379';
process.env.REDIS_DB = process.env.TEST_REDIS_DB || '15';

// 扩展 Jest 匹配器
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeUuid(): R;
      toBeJwtToken(): R;
      toHaveValidStructure(): R;
    }
  }
}

// 自定义匹配器
expect.extend({
  toBeValidDate(received: any) {
    const isValidDate = received instanceof Date && !isNaN(received.getTime());
    return {
      message: () => `expected ${received} to be a valid Date`,
      pass: isValidDate,
    };
  },

  toBeUuid(received: any) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = typeof received === 'string' && uuidRegex.test(received);
    return {
      message: () => `expected ${received} to be a valid UUID`,
      pass: isUuid,
    };
  },

  toBeJwtToken(received: any) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    const isJwt = typeof received === 'string' && jwtRegex.test(received);
    return {
      message: () => `expected ${received} to be a valid JWT token`,
      pass: isJwt,
    };
  },

  toHaveValidStructure(received: any) {
    const hasStructure =
      received &&
      typeof received === 'object' &&
      'code' in received &&
      'message' in received &&
      'data' in received &&
      'timestamp' in received;

    return {
      message: () =>
        `expected ${JSON.stringify(received)} to have valid API response structure`,
      pass: hasStructure,
    };
  },
});

// 全局测试钩子
beforeAll(async () => {
  // 设置测试超时
  jest.setTimeout(30000);

  // 静默控制台输出（可选）
  if (process.env.SILENT_TESTS === 'true') {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(async () => {
  // 清理资源
  await new Promise((resolve) => setTimeout(resolve, 500));
});

// 每个测试前的设置
beforeEach(() => {
  // 清除所有mock
  jest.clearAllMocks();

  // 重置时间
  jest.useRealTimers();
});

afterEach(() => {
  // 恢复所有mock
  jest.restoreAllMocks();
});

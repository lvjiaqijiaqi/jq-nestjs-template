import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),

  // 连接选项
  retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '3000', 10),

  // 连接池配置
  maxRetriesPerRequest: parseInt(
    process.env.REDIS_MAX_RETRIES_PER_REQUEST || '3',
    10,
  ),
  lazyConnect: process.env.REDIS_LAZY_CONNECT === 'true' || true,

  // 键前缀
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'jq-project:',
}));

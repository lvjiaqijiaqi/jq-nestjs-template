import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import redisConfig from './redis.config';
import securityConfig from './security.config';
import loggerConfig from './logger.config';
import cacheConfig from './cache.config';
import queueConfig from './queue.config';
import monitoringConfig from './monitoring.config';

export const configurations = [
  appConfig,
  databaseConfig,
  jwtConfig,
  redisConfig,
  securityConfig,
  loggerConfig,
  cacheConfig,
  queueConfig,
  monitoringConfig,
];

export { validationSchema } from './validation.schema';

// 导出配置类型定义
export type AppConfig = ReturnType<typeof appConfig>;
export type DatabaseConfig = ReturnType<typeof databaseConfig>;
export type JwtConfig = ReturnType<typeof jwtConfig>;
export type RedisConfig = ReturnType<typeof redisConfig>;

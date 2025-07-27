import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // 应用配置
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('jq-project-template'),
  APP_VERSION: Joi.string().default('1.0.0'),

  // API 配置
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('v1'),

  // 数据库配置 (开发环境可选，生产环境必须)
  DB_TYPE: Joi.string().valid('postgres', 'mysql', 'sqlite', 'mongodb').default('mysql'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_NAME: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),
  DB_SSL_REJECT_UNAUTHORIZED: Joi.boolean().default(true),
  DB_MAX_CONNECTIONS: Joi.number().default(10),
  DB_MIN_CONNECTIONS: Joi.number().default(1),
  DB_ACQUIRE_TIMEOUT: Joi.number().default(60000),
  DB_IDLE_TIMEOUT: Joi.number().default(600000),

  // JWT 配置
  JWT_SECRET: Joi.string().min(32).default('your-super-secret-jwt-key-change-this-in-production-at-least-32-characters-long'),
  JWT_REFRESH_SECRET: Joi.string().min(32).default('your-super-secret-refresh-key-change-this-in-production-at-least-32-characters-long'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_ISSUER: Joi.string().allow('').optional(),
  JWT_AUDIENCE: Joi.string().allow('').optional(),

  // Redis 配置 (可选)
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  // CORS 配置
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // 邮件配置 (可选)
  MAIL_HOST: Joi.string().allow('').optional(),
  MAIL_PORT: Joi.number().allow('').optional(),
  MAIL_USER: Joi.string().allow('').optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().allow('').optional(),

  // 日志配置
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),

  // 安全配置
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),
  BODY_PARSER_LIMIT: Joi.string().default('10mb'),
  BODY_PARSER_PARAMETER_LIMIT: Joi.number().default(1000),
  
  // 密码策略
  PASSWORD_MIN_LENGTH: Joi.number().default(8),
  PASSWORD_REQUIRE_UPPERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_LOWERCASE: Joi.boolean().default(true),
  PASSWORD_REQUIRE_NUMBERS: Joi.boolean().default(true),
  PASSWORD_REQUIRE_SYMBOLS: Joi.boolean().default(false),
  
  // IP过滤
  IP_WHITELIST: Joi.string().allow('').optional(),
  IP_BLACKLIST: Joi.string().allow('').optional(),
  
  // 会话安全
  MAX_CONCURRENT_SESSIONS: Joi.number().default(5),
  SESSION_TIMEOUT: Joi.number().default(3600),

  // 云存储配置 (可选)
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_S3_BUCKET_NAME: Joi.string().allow('').optional(),

  // 第三方服务配置 (可选)
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GITHUB_CLIENT_ID: Joi.string().allow('').optional(),
  GITHUB_CLIENT_SECRET: Joi.string().allow('').optional(),
  WECHAT_APP_ID: Joi.string().allow('').optional(),
  WECHAT_APP_SECRET: Joi.string().allow('').optional(),

  // 监控配置 (可选)
  SENTRY_DSN: Joi.string().allow('').optional(),
}); 
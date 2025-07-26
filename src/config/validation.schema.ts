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

  // 安全配置
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // 数据库配置 (开发环境可选，生产环境必须)
  DB_TYPE: Joi.string().valid('postgres', 'mysql', 'sqlite', 'mongodb').default('postgres'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'production', 
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  DB_NAME: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(), 
    otherwise: Joi.optional()
  }),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_SSL: Joi.boolean().default(false),

  // JWT 配置
  JWT_SECRET: Joi.string().min(32).default('your-super-secret-jwt-key-change-this-in-production-at-least-32-characters-long'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().min(32).default('your-super-secret-refresh-key-change-this-in-production-at-least-32-characters-long'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // Redis 配置
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  // 限流配置
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // 文件上传配置
  UPLOAD_MAX_SIZE: Joi.number().default(10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: Joi.string().default('jpg,jpeg,png,gif,pdf,doc,docx'),

  // 邮件配置
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().default(587),
  MAIL_USER: Joi.string().optional(),
  MAIL_PASS: Joi.string().optional(),
  MAIL_FROM: Joi.string().optional(),

  // 云存储配置 (完全可选)
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_S3_BUCKET: Joi.string().allow('').optional(),
  AWS_S3_REGION: Joi.string().allow('').optional(),

  // 第三方服务 (完全可选)
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GITHUB_CLIENT_ID: Joi.string().allow('').optional(),
  GITHUB_CLIENT_SECRET: Joi.string().allow('').optional(),

  // 监控和日志
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  SENTRY_DSN: Joi.string().allow('').optional(),
}); 
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // 基础配置
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  name: process.env.APP_NAME || 'jq-project-template',
  version: process.env.APP_VERSION || '1.0.0',

  // API 配置
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
    timeout: parseInt(process.env.API_TIMEOUT || '30000', 10), // 30秒
    maxRequestSize: process.env.API_MAX_REQUEST_SIZE || '10mb',
  },

  // CORS 配置
  cors: {
    enabled: process.env.CORS_ENABLED === 'true' || true,
    credentials: process.env.CORS_CREDENTIALS === 'true' || true,
    origin: process.env.CORS_ORIGIN || true, // 开发环境允许所有来源
    methods: (
      process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    ).split(','),
    allowedHeaders: (
      process.env.CORS_ALLOWED_HEADERS ||
      'Content-Type,Authorization,X-Requested-With,X-API-Version,X-Request-Id'
    ).split(','),
    exposedHeaders: (
      process.env.CORS_EXPOSED_HEADERS ||
      'X-Total-Count,X-Request-Id,X-API-Version'
    ).split(','),
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10), // 24小时
  },

  // 文档配置
  docs: {
    enabled:
      process.env.DOCS_ENABLED !== 'false' &&
      process.env.NODE_ENV !== 'production',
    path: process.env.DOCS_PATH || 'docs',
    title: process.env.DOCS_TITLE || 'NestJS 企业级样板 API',
    description:
      process.env.DOCS_DESCRIPTION || '企业级 NestJS 样板项目 API 文档',
    version: process.env.DOCS_VERSION || '1.0.0',
  },

  // 响应配置
  response: {
    // 默认分页大小
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
    // 最大分页大小
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
    // 是否启用响应时间头
    enableTimingHeader: process.env.ENABLE_TIMING_HEADER === 'true' || false,
    // 响应压缩阈值
    compressionThreshold: parseInt(
      process.env.COMPRESSION_THRESHOLD || '1024',
      10,
    ),
  },

  // 限流配置
  rateLimit: {
    // 全局限流
    global: {
      ttl: parseInt(process.env.GLOBAL_RATE_LIMIT_TTL || '60', 10), // 时间窗口（秒）
      limit: parseInt(process.env.GLOBAL_RATE_LIMIT_LIMIT || '100', 10), // 请求次数
    },
    // 认证接口限流
    auth: {
      ttl: parseInt(process.env.AUTH_RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.AUTH_RATE_LIMIT_LIMIT || '10', 10),
    },
    // 搜索接口限流
    search: {
      ttl: parseInt(process.env.SEARCH_RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.SEARCH_RATE_LIMIT_LIMIT || '30', 10),
    },
  },

  // 缓存配置
  cache: {
    // 默认TTL（秒）
    defaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5分钟
    // 最大TTL（秒）
    maxTtl: parseInt(process.env.CACHE_MAX_TTL || '3600', 10), // 1小时
    // 是否启用缓存
    enabled: process.env.CACHE_ENABLED === 'true' || false,
  },

  // 健康检查配置
  health: {
    // 检查间隔（毫秒）
    checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10), // 30秒
    // 超时时间（毫秒）
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10), // 5秒
    // 是否启用详细检查
    detailed: process.env.HEALTH_CHECK_DETAILED === 'true' || false,
  },

  // 功能开关
  features: {
    // 是否启用API版本控制
    apiVersioning: process.env.FEATURE_API_VERSIONING === 'true' || true,
    // 是否启用请求ID追踪
    requestId: process.env.FEATURE_REQUEST_ID === 'true' || true,
    // 是否启用响应时间记录
    responseTime: process.env.FEATURE_RESPONSE_TIME === 'true' || true,
    // 是否启用详细错误信息（仅开发环境）
    detailedErrors:
      process.env.FEATURE_DETAILED_ERRORS === 'true' ||
      process.env.NODE_ENV === 'development',
    // 是否启用数据库查询日志
    queryLogging:
      process.env.FEATURE_QUERY_LOGGING === 'true' ||
      process.env.NODE_ENV === 'development',
  },

  // 环境特定配置
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
}));

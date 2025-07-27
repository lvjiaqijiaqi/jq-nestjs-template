import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // 应用配置
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('jq-project-template'),
  APP_VERSION: Joi.string().default('1.0.0'),

  // 数据库配置
  DB_TYPE: Joi.string().valid('mysql', 'postgres').default('mysql'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.string().valid('true', 'false').default('false'),
  DB_LOGGING: Joi.string().valid('true', 'false').default('false'),
  
  // 数据库连接池配置
  DB_MAX_CONNECTIONS: Joi.number().default(20),
  DB_MIN_CONNECTIONS: Joi.number().default(2),
  DB_ACQUIRE_TIMEOUT: Joi.number().default(60000),
  DB_IDLE_TIMEOUT: Joi.number().default(60000),
  DB_MAX_QUERY_EXECUTION_TIME: Joi.number().default(2000),
  DB_RETRY_ATTEMPTS: Joi.number().default(10),
  DB_RETRY_DELAY: Joi.number().default(3000),

  // JWT配置
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  JWT_ISSUER: Joi.string().default('jq-project-template'),
  JWT_AUDIENCE: Joi.string().default('jq-project-template-users'),

  // Redis配置
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('', null).optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_KEY_PREFIX: Joi.string().default('jq-app:'),
  REDIS_MAX_RETRIES: Joi.number().default(3),
  REDIS_RETRY_DELAY: Joi.number().default(100),
  REDIS_CONNECT_TIMEOUT: Joi.number().default(10000),
  REDIS_COMMAND_TIMEOUT: Joi.number().default(5000),

  // 缓存配置
  CACHE_ENABLED: Joi.string().valid('true', 'false').default('true'),
  CACHE_DEFAULT_TTL: Joi.number().default(300),
  CACHE_DEFAULT_MAX: Joi.number().default(1000),
  CACHE_USER_TTL: Joi.number().default(600),
  CACHE_USER_MAX: Joi.number().default(10000),
  CACHE_PERMISSION_TTL: Joi.number().default(1800),
  CACHE_PERMISSION_MAX: Joi.number().default(5000),
  CACHE_API_TTL: Joi.number().default(120),
  CACHE_API_MAX: Joi.number().default(5000),
  CACHE_QUERY_TTL: Joi.number().default(60),
  CACHE_QUERY_MAX: Joi.number().default(20000),
  CACHE_SESSION_TTL: Joi.number().default(3600),
  CACHE_SESSION_MAX: Joi.number().default(50000),
  CACHE_VERIFICATION_TTL: Joi.number().default(300),
  CACHE_VERIFICATION_MAX: Joi.number().default(10000),
  
  // 缓存性能配置
  CACHE_ENABLE_STATS: Joi.string().valid('true', 'false').default('false'),
  CACHE_BATCH_SIZE: Joi.number().default(100),
  CACHE_PRELOAD_ENABLED: Joi.string().valid('true', 'false').default('false'),
  CACHE_PRELOAD_KEYS: Joi.string().allow('').default(''),
  CACHE_COMPRESSION_ENABLED: Joi.string().valid('true', 'false').default('false'),
  CACHE_COMPRESSION_THRESHOLD: Joi.number().default(1024),
  CACHE_SERIALIZATION_TYPE: Joi.string().valid('json', 'msgpack').default('json'),
  
  // 缓存清理策略
  CACHE_LRU_ENABLED: Joi.string().valid('true', 'false').default('true'),
  CACHE_LRU_MAX_AGE: Joi.number().default(3600),
  CACHE_SCHEDULED_CLEANUP_ENABLED: Joi.string().valid('true', 'false').default('false'),
  CACHE_CLEANUP_INTERVAL: Joi.string().default('0 0 * * *'),
  CACHE_MEMORY_CLEANUP_ENABLED: Joi.string().valid('true', 'false').default('false'),
  CACHE_MEMORY_THRESHOLD: Joi.number().min(0).max(1).default(0.8),
  
  // 缓存集群配置
  CACHE_CLUSTER_ENABLED: Joi.string().valid('true', 'false').default('false'),
  CACHE_CLUSTER_NODES: Joi.string().allow('', null).optional(),

  // 安全配置
  CORS_ENABLED: Joi.string().valid('true', 'false').default('true'),
  CORS_CREDENTIALS: Joi.string().valid('true', 'false').default('true'),
  CORS_ORIGIN: Joi.string().default('true'),
  CORS_METHODS: Joi.string().default('GET,POST,PUT,PATCH,DELETE,OPTIONS'),
  CORS_ALLOWED_HEADERS: Joi.string().default('Content-Type,Authorization,X-Requested-With,X-API-Version,X-Request-Id'),
  CORS_EXPOSED_HEADERS: Joi.string().default('X-Total-Count,X-Request-Id,X-API-Version'),
  CORS_MAX_AGE: Joi.number().default(86400),

  // API配置
  API_PREFIX: Joi.string().default('api'),
  API_VERSION: Joi.string().default('v1'),
  API_TIMEOUT: Joi.number().default(30000),
  API_MAX_REQUEST_SIZE: Joi.string().default('10mb'),

  // 限流配置
  GLOBAL_RATE_LIMIT_TTL: Joi.number().default(60),
  GLOBAL_RATE_LIMIT_LIMIT: Joi.number().default(100),
  AUTH_RATE_LIMIT_TTL: Joi.number().default(60),
  AUTH_RATE_LIMIT_LIMIT: Joi.number().default(10),
  SEARCH_RATE_LIMIT_TTL: Joi.number().default(60),
  SEARCH_RATE_LIMIT_LIMIT: Joi.number().default(30),

  // 响应配置
  DEFAULT_PAGE_SIZE: Joi.number().default(10),
  MAX_PAGE_SIZE: Joi.number().default(100),
  ENABLE_TIMING_HEADER: Joi.string().valid('true', 'false').default('false'),
  COMPRESSION_THRESHOLD: Joi.number().default(1024),

  // 健康检查配置
  HEALTH_CHECK_INTERVAL: Joi.number().default(30000),
  HEALTH_CHECK_TIMEOUT: Joi.number().default(5000),
  HEALTH_CHECK_DETAILED: Joi.string().valid('true', 'false').default('false'),

  // 功能开关
  FEATURE_API_VERSIONING: Joi.string().valid('true', 'false').default('true'),
  FEATURE_REQUEST_ID: Joi.string().valid('true', 'false').default('true'),
  FEATURE_RESPONSE_TIME: Joi.string().valid('true', 'false').default('true'),
  FEATURE_DETAILED_ERRORS: Joi.string().valid('true', 'false').default('false'),
  FEATURE_QUERY_LOGGING: Joi.string().valid('true', 'false').default('false'),

  // 安全配置
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),
  BODY_PARSER_LIMIT: Joi.string().default('10mb'),
  BODY_PARSER_PARAMETER_LIMIT: Joi.number().default(1000),
  
  // 密码策略
  PASSWORD_MIN_LENGTH: Joi.number().default(8),
  PASSWORD_REQUIRE_UPPERCASE: Joi.string().valid('true', 'false').default('true'),
  PASSWORD_REQUIRE_LOWERCASE: Joi.string().valid('true', 'false').default('true'),
  PASSWORD_REQUIRE_NUMBERS: Joi.string().valid('true', 'false').default('true'),
  PASSWORD_REQUIRE_SYMBOLS: Joi.string().valid('true', 'false').default('true'),

  // IP过滤
  IP_WHITELIST: Joi.string().allow('').default(''),
  IP_BLACKLIST: Joi.string().allow('').default(''),

  // 会话安全
  MAX_CONCURRENT_SESSIONS: Joi.number().default(5),
  SESSION_TIMEOUT: Joi.number().default(1800),

  // 日志配置
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'simple').default('json'),
  LOG_FILE_ENABLED: Joi.string().valid('true', 'false').default('true'),
  LOG_MAX_FILES: Joi.number().default(5),
  LOG_MAX_SIZE: Joi.string().default('20m'),

  // 文档配置
  DOCS_ENABLED: Joi.string().valid('true', 'false').default('true'),
  DOCS_PATH: Joi.string().default('docs'),
  DOCS_TITLE: Joi.string().default('NestJS 企业级样板 API'),
  DOCS_DESCRIPTION: Joi.string().default('企业级 NestJS 样板项目 API 文档'),
  DOCS_VERSION: Joi.string().default('1.0.0'),
}); 
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

  // 队列配置
  REDIS_QUEUE_DB: Joi.number().default(2),
  REDIS_QUEUE_PREFIX: Joi.string().default('bull:'),
  
  // 队列作业配置
  QUEUE_REMOVE_ON_COMPLETE: Joi.number().default(100),
  QUEUE_REMOVE_ON_FAIL: Joi.number().default(50),
  
  // 邮件队列配置
  QUEUE_EMAIL_ATTEMPTS: Joi.number().default(3),
  QUEUE_EMAIL_BACKOFF_DELAY: Joi.number().default(2000),
  QUEUE_EMAIL_CONCURRENCY: Joi.number().default(5),
  
  // 文件队列配置
  QUEUE_FILE_ATTEMPTS: Joi.number().default(2),
  QUEUE_FILE_BACKOFF_DELAY: Joi.number().default(1000),
  QUEUE_FILE_CONCURRENCY: Joi.number().default(3),
  
  // 通知队列配置
  QUEUE_NOTIFICATION_ATTEMPTS: Joi.number().default(5),
  QUEUE_NOTIFICATION_BACKOFF_DELAY: Joi.number().default(1000),
  QUEUE_NOTIFICATION_CONCURRENCY: Joi.number().default(10),
  
  // 数据队列配置
  QUEUE_DATA_ATTEMPTS: Joi.number().default(1),
  QUEUE_DATA_CONCURRENCY: Joi.number().default(2),
  
  // 报表队列配置
  QUEUE_REPORT_ATTEMPTS: Joi.number().default(2),
  QUEUE_REPORT_BACKOFF_DELAY: Joi.number().default(5000),
  QUEUE_REPORT_CONCURRENCY: Joi.number().default(1),
  
  // 队列监控配置
  QUEUE_MONITORING_ENABLED: Joi.string().valid('true', 'false').default('false'),
  QUEUE_MONITORING_PORT: Joi.number().default(3001),
  QUEUE_MONITORING_PATH: Joi.string().default('/admin/queues'),
  
  // 队列清理配置
  QUEUE_CLEANUP_ENABLED: Joi.string().valid('true', 'false').default('false'),
  QUEUE_CLEANUP_INTERVAL: Joi.string().default('0 2 * * *'),
  QUEUE_CLEANUP_RETAIN_DAYS: Joi.number().default(7),
  
  // 队列重试配置
  QUEUE_MAX_ATTEMPTS: Joi.number().default(3),
  QUEUE_BACKOFF_TYPE: Joi.string().valid('exponential', 'fixed').default('exponential'),
  QUEUE_BACKOFF_DELAY: Joi.number().default(2000),
  
  // 队列全局配置
  QUEUE_GLOBAL_REMOVE_ON_COMPLETE: Joi.number().default(100),
  QUEUE_GLOBAL_REMOVE_ON_FAIL: Joi.number().default(50),
  QUEUE_STALLED_INTERVAL: Joi.number().default(30000),
  QUEUE_MAX_STALLED_COUNT: Joi.number().default(1),
  QUEUE_RATE_LIMIT_MAX: Joi.number().default(100),
  QUEUE_RATE_LIMIT_DURATION: Joi.number().default(60000),

  // 监控配置
  // 健康检查配置
  HEALTH_CHECK_ENABLED: Joi.string().valid('true', 'false').default('true'),
  HEALTH_CHECK_ENDPOINT: Joi.string().default('/health'),
  HEALTH_CHECK_TIMEOUT: Joi.number().default(5000),
  HEALTH_CHECK_RETRIES: Joi.number().default(3),
  GRACEFUL_SHUTDOWN_ENABLED: Joi.string().valid('true', 'false').default('false'),
  GRACEFUL_SHUTDOWN_TIMEOUT: Joi.number().default(30000),
  
  // 健康检查项配置
  HEALTH_CHECK_DATABASE: Joi.string().valid('true', 'false').default('true'),
  HEALTH_CHECK_REDIS: Joi.string().valid('true', 'false').default('true'),
  HEALTH_CHECK_QUEUE: Joi.string().valid('true', 'false').default('true'),
  HEALTH_CHECK_MEMORY: Joi.string().valid('true', 'false').default('true'),
  HEALTH_CHECK_DISK: Joi.string().valid('true', 'false').default('true'),
  HEALTH_CHECK_EXTERNAL: Joi.string().valid('true', 'false').default('false'),
  
  // 指标收集配置
  METRICS_ENABLED: Joi.string().valid('true', 'false').default('true'),
  METRICS_ENDPOINT: Joi.string().default('/metrics'),
  METRICS_PREFIX: Joi.string().default('nestjs_'),
  COLLECT_DEFAULT_METRICS: Joi.string().valid('true', 'false').default('true'),
  METRICS_COLLECT_INTERVAL: Joi.number().default(10000),
  
  // HTTP指标配置
  HTTP_METRICS_ENABLED: Joi.string().valid('true', 'false').default('true'),
  HTTP_PATH_NORMALIZATION: Joi.string().valid('true', 'false').default('false'),
  HTTP_METRICS_EXCLUDE_PATHS: Joi.string().default('/health,/metrics'),
  HTTP_INCLUDE_STATUS_CODE: Joi.string().valid('true', 'false').default('true'),
  HTTP_INCLUDE_METHOD: Joi.string().valid('true', 'false').default('true'),
  HTTP_INCLUDE_PATH: Joi.string().valid('true', 'false').default('true'),
  
  // APM配置
  APM_ENABLED: Joi.string().valid('true', 'false').default('false'),
  APM_SERVICE_NAME: Joi.string().default('jq-project-template'),
  APM_SERVICE_VERSION: Joi.string().default('1.0.0'),
  APM_ENVIRONMENT: Joi.string().optional(),
  APM_TRANSACTION_SAMPLE_RATE: Joi.number().min(0).max(1).default(1.0),
  APM_CAPTURE_BODY: Joi.string().valid('off', 'errors', 'transactions', 'all').default('errors'),
  APM_CAPTURE_HEADERS: Joi.string().valid('true', 'false').default('false'),
  APM_LOG_LEVEL: Joi.string().valid('trace', 'debug', 'info', 'warn', 'error', 'fatal').default('info'),
  
  // 错误监控配置 (Sentry)
  ERROR_MONITORING_ENABLED: Joi.string().valid('true', 'false').default('false'),
  SENTRY_DSN: Joi.string().allow('').optional(),
  SENTRY_ENVIRONMENT: Joi.string().optional(),
  SENTRY_RELEASE: Joi.string().default('1.0.0'),
  SENTRY_SAMPLE_RATE: Joi.number().min(0).max(1).default(1.0),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),
  SENTRY_ATTACH_STACKTRACE: Joi.string().valid('true', 'false').default('true'),
  SENTRY_BEFORE_SEND: Joi.string().valid('true', 'false').default('false'),
  SENTRY_HTTP_INTEGRATION: Joi.string().valid('true', 'false').default('true'),
  SENTRY_CONSOLE_INTEGRATION: Joi.string().valid('true', 'false').default('false'),
  SENTRY_MODULES_INTEGRATION: Joi.string().valid('true', 'false').default('false'),
  
  // 链路追踪配置 (Jaeger)
  TRACING_ENABLED: Joi.string().valid('true', 'false').default('false'),
  TRACING_SERVICE_NAME: Joi.string().default('jq-project-template'),
  TRACING_ENDPOINT: Joi.string().default('http://localhost:14268/api/traces'),
  TRACING_SAMPLER_TYPE: Joi.string().valid('const', 'probabilistic', 'rateLimiting', 'remote').default('const'),
  TRACING_SAMPLER_PARAM: Joi.number().default(1),
  TRACING_LOG_SPANS: Joi.string().valid('true', 'false').default('false'),
  JAEGER_AGENT_HOST: Joi.string().default('localhost'),
  JAEGER_AGENT_PORT: Joi.number().default(6832),
  
  // 性能阈值配置
  RESPONSE_TIME_WARNING: Joi.number().default(1000),
  RESPONSE_TIME_CRITICAL: Joi.number().default(3000),
  MEMORY_WARNING_THRESHOLD: Joi.number().min(0).max(1).default(0.8),
  MEMORY_CRITICAL_THRESHOLD: Joi.number().min(0).max(1).default(0.9),
  CPU_WARNING_THRESHOLD: Joi.number().min(0).max(1).default(0.7),
  CPU_CRITICAL_THRESHOLD: Joi.number().min(0).max(1).default(0.9),
  DISK_WARNING_THRESHOLD: Joi.number().min(0).max(1).default(0.8),
  DISK_CRITICAL_THRESHOLD: Joi.number().min(0).max(1).default(0.9),
  ERROR_RATE_WARNING: Joi.number().min(0).max(1).default(0.05),
  ERROR_RATE_CRITICAL: Joi.number().min(0).max(1).default(0.1),
  QUEUE_BACKLOG_WARNING: Joi.number().default(100),
  QUEUE_BACKLOG_CRITICAL: Joi.number().default(500),
  
  // 告警配置
  ALERTING_ENABLED: Joi.string().valid('true', 'false').default('false'),
  ALERT_EMAIL_ENABLED: Joi.string().valid('true', 'false').default('false'),
  ALERT_EMAIL_RECIPIENTS: Joi.string().allow('').optional(),
  ALERT_SMTP_HOST: Joi.string().allow('').optional(),
  ALERT_SMTP_PORT: Joi.number().default(587),
  ALERT_SMTP_SECURE: Joi.string().valid('true', 'false').default('false'),
  ALERT_SMTP_USER: Joi.string().allow('').optional(),
  ALERT_SMTP_PASS: Joi.string().allow('').optional(),
  ALERT_WEBHOOK_ENABLED: Joi.string().valid('true', 'false').default('false'),
  ALERT_WEBHOOK_URL: Joi.string().allow('').optional(),
  ALERT_WEBHOOK_TIMEOUT: Joi.number().default(5000),
  ALERT_WEBHOOK_RETRIES: Joi.number().default(3),
  ALERT_SLACK_ENABLED: Joi.string().valid('true', 'false').default('false'),
  SLACK_WEBHOOK_URL: Joi.string().allow('').optional(),
  SLACK_CHANNEL: Joi.string().default('#alerts'),
  SLACK_USERNAME: Joi.string().default('MonitorBot'),
  
  // 告警规则配置
  ALERT_HEALTH_CHECK: Joi.string().valid('true', 'false').default('false'),
  ALERT_HIGH_RESPONSE_TIME: Joi.string().valid('true', 'false').default('false'),
  ALERT_HIGH_ERROR_RATE: Joi.string().valid('true', 'false').default('false'),
  ALERT_HIGH_MEMORY: Joi.string().valid('true', 'false').default('false'),
  ALERT_HIGH_CPU: Joi.string().valid('true', 'false').default('false'),
  ALERT_HIGH_DISK: Joi.string().valid('true', 'false').default('false'),
  ALERT_QUEUE_BACKLOG: Joi.string().valid('true', 'false').default('false'),
  ALERT_COOLDOWN: Joi.number().default(300000),
  
  // 数据保留配置
  METRICS_SHORT_TERM_RETENTION: Joi.number().default(604800),    // 7天
  METRICS_LONG_TERM_RETENTION: Joi.number().default(2592000),   // 30天
  TRACES_RETENTION: Joi.number().default(259200),               // 3天
  LOGS_RETENTION: Joi.number().default(1209600),                // 14天

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
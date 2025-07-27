import { registerAs } from '@nestjs/config';

export default registerAs('monitoring', () => ({
  // 健康检查配置
  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    endpoint: process.env.HEALTH_CHECK_ENDPOINT || '/health',
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10),
    retries: parseInt(process.env.HEALTH_CHECK_RETRIES || '3', 10),
    gracefulShutdown: {
      enabled: process.env.GRACEFUL_SHUTDOWN_ENABLED === 'true',
      timeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '30000', 10),
    },
    checks: {
      database: process.env.HEALTH_CHECK_DATABASE !== 'false',
      redis: process.env.HEALTH_CHECK_REDIS !== 'false',
      queue: process.env.HEALTH_CHECK_QUEUE !== 'false',
      memory: process.env.HEALTH_CHECK_MEMORY !== 'false',
      disk: process.env.HEALTH_CHECK_DISK !== 'false',
      external: process.env.HEALTH_CHECK_EXTERNAL === 'true',
    },
  },

  // 指标收集配置
  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    endpoint: process.env.METRICS_ENDPOINT || '/metrics',
    prefix: process.env.METRICS_PREFIX || 'nestjs_',
    defaultLabels: {
      app: process.env.APP_NAME || 'jq-project-template',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      instance: process.env.INSTANCE_ID || require('os').hostname(),
    },
    collectDefaultMetrics: process.env.COLLECT_DEFAULT_METRICS !== 'false',
    collectInterval: parseInt(process.env.METRICS_COLLECT_INTERVAL || '10000', 10), // 10秒
    httpMetrics: {
      enabled: process.env.HTTP_METRICS_ENABLED !== 'false',
      pathNormalization: process.env.HTTP_PATH_NORMALIZATION === 'true',
      excludePaths: (process.env.HTTP_METRICS_EXCLUDE_PATHS || '/health,/metrics').split(','),
      includeStatusCode: process.env.HTTP_INCLUDE_STATUS_CODE !== 'false',
      includeMethod: process.env.HTTP_INCLUDE_METHOD !== 'false',
      includePath: process.env.HTTP_INCLUDE_PATH !== 'false',
    },
  },

  // 性能监控配置
  apm: {
    enabled: process.env.APM_ENABLED === 'true',
    serviceName: process.env.APM_SERVICE_NAME || 'jq-project-template',
    serviceVersion: process.env.APM_SERVICE_VERSION || '1.0.0',
    environment: process.env.APM_ENVIRONMENT || process.env.NODE_ENV || 'development',
    transactionSampleRate: parseFloat(process.env.APM_TRANSACTION_SAMPLE_RATE || '1.0'),
    captureBody: process.env.APM_CAPTURE_BODY || 'errors',
    captureHeaders: process.env.APM_CAPTURE_HEADERS === 'true',
    logLevel: process.env.APM_LOG_LEVEL || 'info',
  },

  // 错误监控配置
  errorMonitoring: {
    enabled: process.env.ERROR_MONITORING_ENABLED === 'true',
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || '1.0.0',
    sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || '1.0'),
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    attachStacktrace: process.env.SENTRY_ATTACH_STACKTRACE !== 'false',
    beforeSend: process.env.SENTRY_BEFORE_SEND === 'true',
    integrations: {
      http: process.env.SENTRY_HTTP_INTEGRATION !== 'false',
      console: process.env.SENTRY_CONSOLE_INTEGRATION === 'true',
      modules: process.env.SENTRY_MODULES_INTEGRATION === 'true',
    },
  },

  // 链路追踪配置
  tracing: {
    enabled: process.env.TRACING_ENABLED === 'true',
    serviceName: process.env.TRACING_SERVICE_NAME || 'jq-project-template',
    endpoint: process.env.TRACING_ENDPOINT || 'http://localhost:14268/api/traces',
    sampler: {
      type: process.env.TRACING_SAMPLER_TYPE || 'const',
      param: parseFloat(process.env.TRACING_SAMPLER_PARAM || '1'),
    },
    reporter: {
      logSpans: process.env.TRACING_LOG_SPANS === 'true',
      agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
      agentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6832', 10),
    },
    tags: {
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  },

  // 性能阈值配置
  thresholds: {
    // 响应时间阈值（毫秒）
    responseTime: {
      warning: parseInt(process.env.RESPONSE_TIME_WARNING || '1000', 10),
      critical: parseInt(process.env.RESPONSE_TIME_CRITICAL || '3000', 10),
    },
    // 内存使用阈值（百分比）
    memory: {
      warning: parseFloat(process.env.MEMORY_WARNING_THRESHOLD || '0.8'), // 80%
      critical: parseFloat(process.env.MEMORY_CRITICAL_THRESHOLD || '0.9'), // 90%
    },
    // CPU使用阈值（百分比）
    cpu: {
      warning: parseFloat(process.env.CPU_WARNING_THRESHOLD || '0.7'), // 70%
      critical: parseFloat(process.env.CPU_CRITICAL_THRESHOLD || '0.9'), // 90%
    },
    // 磁盘使用阈值（百分比）
    disk: {
      warning: parseFloat(process.env.DISK_WARNING_THRESHOLD || '0.8'), // 80%
      critical: parseFloat(process.env.DISK_CRITICAL_THRESHOLD || '0.9'), // 90%
    },
    // 错误率阈值（百分比）
    errorRate: {
      warning: parseFloat(process.env.ERROR_RATE_WARNING || '0.05'), // 5%
      critical: parseFloat(process.env.ERROR_RATE_CRITICAL || '0.1'), // 10%
    },
    // 队列积压阈值
    queueBacklog: {
      warning: parseInt(process.env.QUEUE_BACKLOG_WARNING || '100', 10),
      critical: parseInt(process.env.QUEUE_BACKLOG_CRITICAL || '500', 10),
    },
  },

  // 告警配置
  alerting: {
    enabled: process.env.ALERTING_ENABLED === 'true',
    channels: {
      email: {
        enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
        recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
        smtp: {
          host: process.env.ALERT_SMTP_HOST || '',
          port: parseInt(process.env.ALERT_SMTP_PORT || '587', 10),
          secure: process.env.ALERT_SMTP_SECURE === 'true',
          auth: {
            user: process.env.ALERT_SMTP_USER || '',
            pass: process.env.ALERT_SMTP_PASS || '',
          },
        },
      },
      webhook: {
        enabled: process.env.ALERT_WEBHOOK_ENABLED === 'true',
        url: process.env.ALERT_WEBHOOK_URL || '',
        timeout: parseInt(process.env.ALERT_WEBHOOK_TIMEOUT || '5000', 10),
        retries: parseInt(process.env.ALERT_WEBHOOK_RETRIES || '3', 10),
      },
      slack: {
        enabled: process.env.ALERT_SLACK_ENABLED === 'true',
        webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
        channel: process.env.SLACK_CHANNEL || '#alerts',
        username: process.env.SLACK_USERNAME || 'MonitorBot',
      },
    },
    rules: {
      healthCheck: process.env.ALERT_HEALTH_CHECK === 'true',
      highResponseTime: process.env.ALERT_HIGH_RESPONSE_TIME === 'true',
      highErrorRate: process.env.ALERT_HIGH_ERROR_RATE === 'true',
      highMemoryUsage: process.env.ALERT_HIGH_MEMORY === 'true',
      highCpuUsage: process.env.ALERT_HIGH_CPU === 'true',
      highDiskUsage: process.env.ALERT_HIGH_DISK === 'true',
      queueBacklog: process.env.ALERT_QUEUE_BACKLOG === 'true',
    },
    cooldown: parseInt(process.env.ALERT_COOLDOWN || '300000', 10), // 5分钟
  },

  // 数据保留配置
  retention: {
    metrics: {
      shortTerm: parseInt(process.env.METRICS_SHORT_TERM_RETENTION || '604800', 10), // 7天
      longTerm: parseInt(process.env.METRICS_LONG_TERM_RETENTION || '2592000', 10), // 30天
    },
    traces: {
      retention: parseInt(process.env.TRACES_RETENTION || '259200', 10), // 3天
    },
    logs: {
      retention: parseInt(process.env.LOGS_RETENTION || '1209600', 10), // 14天
    },
  },
})); 
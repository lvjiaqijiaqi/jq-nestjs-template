import { registerAs } from '@nestjs/config';

export default registerAs('queue', () => ({
  // Redis连接配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_QUEUE_DB || '2', 10),
    keyPrefix: process.env.REDIS_QUEUE_PREFIX || 'bull:',
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
    lazyConnect: true,
  },

  // 队列配置
  queues: {
    // 邮件队列
    email: {
      name: 'email-queue',
      defaultJobOptions: {
        removeOnComplete: parseInt(
          process.env.QUEUE_REMOVE_ON_COMPLETE || '100',
          10,
        ),
        removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50', 10),
        attempts: parseInt(process.env.QUEUE_EMAIL_ATTEMPTS || '3', 10),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.QUEUE_EMAIL_BACKOFF_DELAY || '2000', 10),
        },
        delay: 0,
      },
    },

    // 文件处理队列
    file: {
      name: 'file-queue',
      defaultJobOptions: {
        removeOnComplete: parseInt(
          process.env.QUEUE_REMOVE_ON_COMPLETE || '100',
          10,
        ),
        removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50', 10),
        attempts: parseInt(process.env.QUEUE_FILE_ATTEMPTS || '2', 10),
        backoff: {
          type: 'fixed',
          delay: parseInt(process.env.QUEUE_FILE_BACKOFF_DELAY || '1000', 10),
        },
      },
    },

    // 通知队列
    notification: {
      name: 'notification-queue',
      defaultJobOptions: {
        removeOnComplete: parseInt(
          process.env.QUEUE_REMOVE_ON_COMPLETE || '100',
          10,
        ),
        removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50', 10),
        attempts: parseInt(process.env.QUEUE_NOTIFICATION_ATTEMPTS || '5', 10),
        backoff: {
          type: 'exponential',
          delay: parseInt(
            process.env.QUEUE_NOTIFICATION_BACKOFF_DELAY || '1000',
            10,
          ),
        },
      },
    },

    // 数据处理队列
    data: {
      name: 'data-queue',
      defaultJobOptions: {
        removeOnComplete: parseInt(
          process.env.QUEUE_REMOVE_ON_COMPLETE || '100',
          10,
        ),
        removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50', 10),
        attempts: parseInt(process.env.QUEUE_DATA_ATTEMPTS || '1', 10),
        backoff: 'off',
      },
    },

    // 报表队列
    report: {
      name: 'report-queue',
      defaultJobOptions: {
        removeOnComplete: parseInt(
          process.env.QUEUE_REMOVE_ON_COMPLETE || '100',
          10,
        ),
        removeOnFail: parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50', 10),
        attempts: parseInt(process.env.QUEUE_REPORT_ATTEMPTS || '2', 10),
        backoff: {
          type: 'fixed',
          delay: parseInt(process.env.QUEUE_REPORT_BACKOFF_DELAY || '5000', 10),
        },
        delay: 0,
      },
    },
  },

  // 队列优先级配置
  priorities: {
    HIGH: 100,
    NORMAL: 50,
    LOW: 10,
  },

  // 并发配置
  concurrency: {
    email: parseInt(process.env.QUEUE_EMAIL_CONCURRENCY || '5', 10),
    file: parseInt(process.env.QUEUE_FILE_CONCURRENCY || '3', 10),
    notification: parseInt(
      process.env.QUEUE_NOTIFICATION_CONCURRENCY || '10',
      10,
    ),
    data: parseInt(process.env.QUEUE_DATA_CONCURRENCY || '2', 10),
    report: parseInt(process.env.QUEUE_REPORT_CONCURRENCY || '1', 10),
  },

  // 队列监控配置
  monitoring: {
    enabled: process.env.QUEUE_MONITORING_ENABLED === 'true',
    port: parseInt(process.env.QUEUE_MONITORING_PORT || '3001', 10),
    path: process.env.QUEUE_MONITORING_PATH || '/admin/queues',
  },

  // 清理配置
  cleanup: {
    enabled: process.env.QUEUE_CLEANUP_ENABLED === 'true',
    interval: process.env.QUEUE_CLEANUP_INTERVAL || '0 2 * * *', // 每天凌晨2点
    retainDays: parseInt(process.env.QUEUE_CLEANUP_RETAIN_DAYS || '7', 10),
  },

  // 重试配置
  retry: {
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3', 10),
    backoffType: process.env.QUEUE_BACKOFF_TYPE || 'exponential',
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '2000', 10),
  },

  // 全局配置
  global: {
    // 默认作业选项
    defaultJobOptions: {
      removeOnComplete: parseInt(
        process.env.QUEUE_GLOBAL_REMOVE_ON_COMPLETE || '100',
        10,
      ),
      removeOnFail: parseInt(
        process.env.QUEUE_GLOBAL_REMOVE_ON_FAIL || '50',
        10,
      ),
    },

    // 队列设置
    settings: {
      stalledInterval: parseInt(
        process.env.QUEUE_STALLED_INTERVAL || '30000',
        10,
      ), // 30秒
      maxStalledCount: parseInt(process.env.QUEUE_MAX_STALLED_COUNT || '1', 10),
    },

    // 速率限制
    rateLimit: {
      max: parseInt(process.env.QUEUE_RATE_LIMIT_MAX || '100', 10),
      duration: parseInt(process.env.QUEUE_RATE_LIMIT_DURATION || '60000', 10), // 1分钟
    },
  },
}));

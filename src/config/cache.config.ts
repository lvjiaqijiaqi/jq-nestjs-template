import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  // Redis 连接配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'jq-app:',
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
    commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10),
  },

  // 缓存策略配置
  strategies: {
    // 默认缓存
    default: {
      ttl: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5分钟
      max: parseInt(process.env.CACHE_DEFAULT_MAX || '1000', 10), // 最大1000个key
    },

    // 用户数据缓存
    user: {
      ttl: parseInt(process.env.CACHE_USER_TTL || '600', 10), // 10分钟
      max: parseInt(process.env.CACHE_USER_MAX || '10000', 10),
      keyPrefix: 'user:',
    },

    // 权限数据缓存
    permission: {
      ttl: parseInt(process.env.CACHE_PERMISSION_TTL || '1800', 10), // 30分钟
      max: parseInt(process.env.CACHE_PERMISSION_MAX || '5000', 10),
      keyPrefix: 'permission:',
    },

    // API响应缓存
    api: {
      ttl: parseInt(process.env.CACHE_API_TTL || '120', 10), // 2分钟
      max: parseInt(process.env.CACHE_API_MAX || '5000', 10),
      keyPrefix: 'api:',
    },

    // 数据库查询缓存
    query: {
      ttl: parseInt(process.env.CACHE_QUERY_TTL || '60', 10), // 1分钟
      max: parseInt(process.env.CACHE_QUERY_MAX || '20000', 10),
      keyPrefix: 'query:',
    },

    // 会话缓存
    session: {
      ttl: parseInt(process.env.CACHE_SESSION_TTL || '3600', 10), // 1小时
      max: parseInt(process.env.CACHE_SESSION_MAX || '50000', 10),
      keyPrefix: 'session:',
    },

    // 验证码缓存
    verification: {
      ttl: parseInt(process.env.CACHE_VERIFICATION_TTL || '300', 10), // 5分钟
      max: parseInt(process.env.CACHE_VERIFICATION_MAX || '10000', 10),
      keyPrefix: 'verification:',
    },
  },

  // 缓存性能配置
  performance: {
    // 是否启用缓存
    enabled: process.env.CACHE_ENABLED !== 'false',

    // 是否启用缓存统计
    enableStats: process.env.CACHE_ENABLE_STATS === 'true',

    // 批量操作大小
    batchSize: parseInt(process.env.CACHE_BATCH_SIZE || '100', 10),

    // 缓存预热
    preload: {
      enabled: process.env.CACHE_PRELOAD_ENABLED === 'true',
      keys: (process.env.CACHE_PRELOAD_KEYS || '').split(',').filter(Boolean),
    },

    // 缓存压缩
    compression: {
      enabled: process.env.CACHE_COMPRESSION_ENABLED === 'true',
      threshold: parseInt(
        process.env.CACHE_COMPRESSION_THRESHOLD || '1024',
        10,
      ), // 1KB
    },

    // 缓存序列化
    serialization: {
      type: process.env.CACHE_SERIALIZATION_TYPE || 'json', // json, msgpack
    },
  },

  // 缓存清理策略
  eviction: {
    // LRU策略配置
    lru: {
      enabled: process.env.CACHE_LRU_ENABLED !== 'false',
      maxAge: parseInt(process.env.CACHE_LRU_MAX_AGE || '3600', 10), // 1小时
    },

    // 定时清理
    scheduled: {
      enabled: process.env.CACHE_SCHEDULED_CLEANUP_ENABLED === 'true',
      interval: process.env.CACHE_CLEANUP_INTERVAL || '0 0 * * *', // 每天午夜
    },

    // 内存使用率清理
    memory: {
      enabled: process.env.CACHE_MEMORY_CLEANUP_ENABLED === 'true',
      threshold: parseFloat(process.env.CACHE_MEMORY_THRESHOLD || '0.8'), // 80%
    },
  },

  // 集群配置
  cluster: {
    enabled: process.env.CACHE_CLUSTER_ENABLED === 'true',
    nodes: process.env.CACHE_CLUSTER_NODES
      ? process.env.CACHE_CLUSTER_NODES.split(',').map((node) => {
          const [host, port] = node.split(':');
          return { host, port: parseInt(port, 10) };
        })
      : [],
    options: {
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
      },
    },
  },
}));

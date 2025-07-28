import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置
 * 支持MySQL数据库的完整配置，包括连接池、缓存、性能优化等
 *
 * @returns TypeOrmModuleOptions 数据库配置对象
 */
export default registerAs('database', (): TypeOrmModuleOptions => {
  const baseConfig = {
    // ===== 基础连接配置 =====
    type: (process.env.DB_TYPE as any) || 'mysql', // 数据库类型，目前支持mysql
    host: process.env.DB_HOST || 'localhost', // 数据库主机地址
    port: parseInt(process.env.DB_PORT || '3306', 10), // 数据库端口，MySQL默认3306
    username: process.env.DB_USERNAME || 'root', // 数据库用户名
    password: process.env.DB_PASSWORD || '', // 数据库密码
    database: process.env.DB_NAME || 'main', // 数据库名称

    // ===== 实体和迁移配置 =====
    entities: ['dist/**/*.entity{.ts,.js}'], // 实体文件路径模式，支持TypeScript和JavaScript
    migrations: ['dist/migrations/*{.ts,.js}'], // 数据库迁移文件路径
    subscribers: ['dist/subscribers/*{.ts,.js}'], // 数据库订阅者文件路径（用于监听数据库事件）

    // ===== 开发环境行为配置 =====
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false, // 是否自动同步数据库结构（生产环境务必为false）
    migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true' || false, // 是否自动运行迁移文件
    dropSchema: process.env.DB_DROP_SCHEMA === 'true' || false, // 是否在启动时删除数据库结构（危险操作）

    // ===== 日志配置 =====
    // 开发环境显示详细日志，生产环境仅显示错误和警告
    logging:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn', 'info', 'log'] // 开发环境：显示所有类型的日志
        : ['error', 'warn'], // 生产环境：仅显示错误和警告
    logger:
      process.env.NODE_ENV === 'development'
        ? 'advanced-console' // 开发环境：使用高级控制台日志格式
        : 'file', // 生产环境：输出到文件
    maxQueryExecutionTime: parseInt(
      process.env.DB_MAX_QUERY_EXECUTION_TIME || '2000',
      10,
    ), // 慢查询时间阈值（毫秒），超过此时间的查询会被记录

    // ===== MySQL连接池和性能优化配置 =====
    extra: {
      // --- 连接池基础配置 ---
      connectionLimit: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10), // 连接池最大连接数
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10), // 获取连接的超时时间（毫秒）
      timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10), // 连接空闲超时时间（毫秒）

      // --- 连接保持和重连配置 ---
      reconnect: true, // 启用自动重连机制
      reconnectDelay: parseInt(process.env.DB_RECONNECT_DELAY || '2000', 10), // 重连延迟时间（毫秒）

      // --- 字符集和时区配置 ---
      charset: process.env.DB_CHARSET || 'utf8mb4', // 数据库字符集，utf8mb4支持emoji和4字节字符
      timezone: process.env.DB_TIMEZONE || '+08:00', // 数据库时区，+08:00为中国标准时间

      // --- 数据处理优化参数 ---
      dateStrings: false, // 不将日期转换为字符串，保持Date对象类型
      supportBigNumbers: true, // 支持大数字处理（超过JavaScript安全整数范围）
      bigNumberStrings: false, // 大数字不转换为字符串，保持数字类型

      // --- SSL安全连接配置 ---
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              // 是否拒绝未授权的SSL证书
              rejectUnauthorized:
                process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
            }
          : false, // 默认不使用SSL连接

      // --- MySQL连接行为配置 ---
      multipleStatements: false, // 禁止多语句查询（安全考虑）
      flags: [
        // MySQL连接标志，控制连接行为
        'FOUND_ROWS', // 启用FOUND_ROWS功能
        'IGNORE_SIGPIPE', // 忽略SIGPIPE信号
        'IGNORE_SPACE', // 忽略函数名后的空格
        'LONG_FLAG', // 支持长标志
        'PROTOCOL_41', // 使用MySQL 4.1协议
        'TRANSACTIONS', // 启用事务支持
        'SECURE_CONNECTION', // 使用安全连接
      ],
    },

    // ===== Redis缓存配置 =====
    // 如果配置了Redis，则启用TypeORM查询缓存
    cache: process.env.REDIS_HOST
      ? {
          type: 'redis', // 缓存类型：Redis
          options: {
            host: process.env.REDIS_HOST, // Redis主机地址
            port: parseInt(process.env.REDIS_PORT || '6379', 10), // Redis端口
            password: process.env.REDIS_PASSWORD, // Redis密码（可选）
            db: parseInt(process.env.REDIS_CACHE_DB || '1', 10), // Redis数据库编号
            keyPrefix: process.env.REDIS_CACHE_PREFIX || 'typeorm:', // 缓存键前缀
          },
          duration: parseInt(process.env.DB_CACHE_DURATION || '30000', 10), // 缓存持续时间（毫秒）
        }
      : false, // 未配置Redis时禁用缓存

    // ===== 性能监控和调试配置 =====
    verboseRetryLog: process.env.NODE_ENV === 'development', // 开发环境启用详细的重试日志

    // ===== 连接重试配置 =====
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10), // 连接失败时的最大重试次数
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10), // 重试间隔时间（毫秒）

    // ===== TypeORM功能配置 =====
    autoLoadEntities: true, // 自动加载实体，无需手动导入每个实体文件

    // ===== 元数据缓存配置 =====
    metadataTablesCache: process.env.NODE_ENV === 'production', // 生产环境启用元数据表缓存以提升性能

    // ===== 事务配置 =====
    isolationLevel: (process.env.DB_ISOLATION_LEVEL as any) || 'READ_COMMITTED', // 事务隔离级别

    // ===== MySQL专用优化配置 =====
    connectorPackage: 'mysql2', // 使用mysql2驱动，性能更好，支持更多特性

    // --- 时区处理配置 ---
    timezone: process.env.DB_TIMEZONE || '+08:00', // 应用级别的时区设置，与extra.timezone保持一致

    // --- 字符集配置 ---
    charset: process.env.DB_CHARSET || 'utf8mb4', // 应用级别的字符集设置，与extra.charset保持一致

    // --- 日期和时间处理 ---
    dateStrings: false, // 保持日期为Date对象，不转换为字符串

    // --- 数值处理配置 ---
    supportBigNumbers: true, // 启用大数字支持
    bigNumberStrings: false, // 大数字保持为数字类型，不转换为字符串

    // --- 数据类型转换配置 ---
    // 自定义类型转换函数，主要用于MySQL的TINYINT(1)到布尔值的转换
    typeCast: function (field: any, next: any) {
      // 将MySQL的TINYINT(1)字段转换为布尔值
      if (field.type === 'TINY' && field.length === 1) {
        return field.string() === '1'; // '1' 转换为 true，'0' 转换为 false
      }
      return next(); // 其他类型使用默认转换
    },
  };

  return baseConfig as TypeOrmModuleOptions;
});

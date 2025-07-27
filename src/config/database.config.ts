import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const baseConfig = {
    type: (process.env.DB_TYPE as any) || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'main',
    
    // 实体配置
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    subscribers: ['dist/subscribers/*{.ts,.js}'],
    
    // 开发环境配置
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
    migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true' || false,
    dropSchema: process.env.DB_DROP_SCHEMA === 'true' || false,
    
    // 日志配置 - 性能优化：生产环境关闭查询日志
    logging: process.env.NODE_ENV === 'development' ? 
      ['query', 'error', 'warn', 'info', 'log'] : 
      ['error', 'warn'],
    logger: process.env.NODE_ENV === 'development' ? 'advanced-console' : 'file',
    maxQueryExecutionTime: parseInt(process.env.DB_MAX_QUERY_EXECUTION_TIME || '2000', 10), // 2秒慢查询
    
    // 连接池优化配置
    extra: {
      // 连接池大小设置
      connectionLimit: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
      acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10), // 60秒
      timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10), // 60秒
      
      // MySQL特定优化
      ...(process.env.DB_TYPE === 'mysql' && {
        // 连接保持设置
        reconnect: true,
        reconnectDelay: parseInt(process.env.DB_RECONNECT_DELAY || '2000', 10),
        
        // 字符集和时区
        charset: 'utf8mb4',
        timezone: process.env.DB_TIMEZONE || '+00:00',
        
        // 性能优化参数
        dateStrings: false,
        supportBigNumbers: true,
        bigNumberStrings: false,
        
        // SSL配置
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        } : false,
        
        // 连接配置
        multipleStatements: false,
        flags: [
          'FOUND_ROWS',
          'IGNORE_SIGPIPE',
          'IGNORE_SPACE',
          'LONG_FLAG',
          'PROTOCOL_41',
          'TRANSACTIONS',
          'SECURE_CONNECTION',
        ],
      }),
      
      // PostgreSQL特定优化
      ...(process.env.DB_TYPE === 'postgres' && {
        // 连接池配置
        max: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
        min: parseInt(process.env.DB_MIN_CONNECTIONS || '2', 10),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000', 10),
        
        // 应用名称
        application_name: process.env.APP_NAME || 'nestjs-app',
        
        // SSL配置
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        } : false,
        
        // 查询超时
        statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10),
        query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),
        
        // 连接参数
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      }),
    },

    // 缓存配置 - 性能优化
    cache: process.env.REDIS_HOST ? {
      type: 'redis',
      options: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_CACHE_DB || '1', 10),
        keyPrefix: process.env.REDIS_CACHE_PREFIX || 'typeorm:',
      },
      duration: parseInt(process.env.DB_CACHE_DURATION || '30000', 10), // 30秒
    } : false,

    // 性能监控配置
    verboseRetryLog: process.env.NODE_ENV === 'development',
    
    // 连接重试配置
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
    
    // 自动加载实体
    autoLoadEntities: true,
    
    // 元数据缓存
    metadataTablesCache: process.env.NODE_ENV === 'production',
    
    // 事务配置
    isolationLevel: process.env.DB_ISOLATION_LEVEL as any || 'READ_COMMITTED',
    
    // 数据库特定设置
    ...(process.env.DB_TYPE === 'mysql' && {
      // MySQL连接字符串优化
      connectorPackage: 'mysql2',
      
      // 时区处理
      timezone: 'Z', // UTC时间
      
      // 字符集
      charset: 'utf8mb4',
      
      // 日期字符串处理
      dateStrings: false,
      
      // 大数字处理
      supportBigNumbers: true,
      bigNumberStrings: false,
      
      // 严格模式
      typeCast: function (field: any, next: any) {
        if (field.type === 'TINY' && field.length === 1) {
          return field.string() === '1'; // 1 = true, 0 = false
        }
        return next();
      },
    }),

    ...(process.env.DB_TYPE === 'postgres' && {
      // PostgreSQL连接字符串优化
      uuidExtension: 'uuid-ossp',
      
      // 架构
      schema: process.env.DB_SCHEMA || 'public',
      
      // 同步选项
      synchronize: process.env.NODE_ENV === 'development',
      
      // 日期类型
      useUTC: true,
    }),
  };

  return baseConfig as TypeOrmModuleOptions;
}); 
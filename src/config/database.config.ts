import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || false,
  
  // MySQL特定配置
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
  timezone: '+00:00',
  
  // 连接池配置
  extra: {
    connectionLimit: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    timeout: parseInt(process.env.DB_TIMEOUT || '60000', 10),
    reconnect: true,
    reconnectDelay: 2000,
  },
  
  // SSL 配置
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false,
})); 
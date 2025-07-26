import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || false,
  
  // 连接池配置
  extra: {
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    min: parseInt(process.env.DB_MIN_CONNECTIONS || '1', 10),
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '600000', 10),
  },
  
  // SSL 配置
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false,
})); 
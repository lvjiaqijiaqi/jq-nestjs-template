import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// 加载环境变量
config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  
  // 实体路径
  entities: [
    'src/**/*.entity.ts',
    'dist/**/*.entity.js',
  ],
  
  // 迁移配置
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migrations',
  
  // 同步和日志
  synchronize: false, // 生产环境应该为false，使用迁移
  logging: configService.get('DB_LOGGING') === 'true',
  
  // SSL配置
  ssl: configService.get('DB_SSL') === 'true' ? {
    rejectUnauthorized: configService.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false'
  } : false,
}); 
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: configService.get<string>('database.type') as any,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        
        // MySQL 特定配置
        charset: configService.get<string>('database.charset'),
        timezone: configService.get<string>('database.timezone'),
        
        // 实体配置
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        
        // 同步配置 (开发环境)
        synchronize: configService.get<boolean>('database.synchronize'),
        
        // 日志配置
        logging: configService.get<boolean>('database.logging'),
        
        // 迁移配置
        migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
        migrationsRun: false,
        migrationsTableName: 'migrations',
        
        // 连接池配置
        extra: configService.get('database.extra'),
        
        // SSL配置
        ssl: configService.get('database.ssl'),
        
        // 其他配置
        dropSchema: false,
        keepConnectionAlive: true,
        autoLoadEntities: true,
        
        // 命名策略
        namingStrategy: undefined,
        
        // 缓存配置
        cache: {
          type: 'redis',
          options: {
            host: configService.get<string>('redis.host'),
            port: configService.get<number>('redis.port'),
            password: configService.get<string>('redis.password'),
            db: configService.get<number>('redis.db'),
          },
          duration: 30000, // 30秒缓存
        },
      }),
      inject: [ConfigService],
      
      // 数据源工厂，用于迁移和CLI
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('DataSource options are required');
        }
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {} 
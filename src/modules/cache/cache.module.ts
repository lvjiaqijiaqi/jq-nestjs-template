import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './services/cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const cacheConfig = configService.get('cache');
        
        // 如果没有启用缓存，使用内存缓存
        if (!cacheConfig.performance.enabled || !process.env.REDIS_HOST) {
          return {
            ttl: cacheConfig.strategies.default.ttl,
            max: cacheConfig.strategies.default.max,
          };
        }

        const redisConfig = cacheConfig.redis;
        const defaultStrategy = cacheConfig.strategies.default;

        // 动态导入Redis存储
        const redisStore = await import('cache-manager-redis-store');

        return {
          store: redisStore.default,
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          keyPrefix: redisConfig.keyPrefix,
          ttl: defaultStrategy.ttl,
          max: defaultStrategy.max,
          // Redis连接选项
          socket: {
            connectTimeout: redisConfig.connectTimeout,
            commandTimeout: redisConfig.commandTimeout,
          },
          retry_strategy: function (options: any) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              // End reconnecting on a specific error and flush all commands
              return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              // End reconnecting after a specific timeout and flush all commands
              return new Error('Retry time exhausted');
            }
            if (options.attempt > redisConfig.maxRetriesPerRequest) {
              // End reconnecting with built in error
              return undefined;
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000);
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {} 
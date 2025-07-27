import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService, CacheStats } from './cache.service';

/**
 * 缓存健康状态接口
 */
export interface CacheHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  isConnected: boolean;
  stats: CacheStats;
  errors: string[];
  lastCheck: Date;
  uptime: number;
}

/**
 * 缓存健康检查服务
 */
@Injectable()
export class CacheHealthService {
  private readonly logger = new Logger(CacheHealthService.name);
  private lastHealthCheck: CacheHealthStatus | null = null;
  private healthCheckStartTime = Date.now();

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 执行缓存健康检查
   */
  async checkHealth(): Promise<CacheHealthStatus> {
    const startTime = Date.now();
    const errors: string[] = [];
    let isConnected = false;
    let latency = 0;

    try {
      // 测试缓存连接和基本操作
      const testKey = 'health-check-test';
      const testValue = { timestamp: Date.now(), test: true };

      // 测试写入
      await this.cacheService.set(testKey, testValue, { ttl: 10 });

      // 测试读取
      const readStartTime = Date.now();
      const result = await this.cacheService.get(testKey);
      latency = Date.now() - readStartTime;

      if (
        result &&
        typeof result === 'object' &&
        (result as any).test === true
      ) {
        isConnected = true;
      } else {
        errors.push('Cache read/write test failed');
      }

      // 清理测试键
      await this.cacheService.del(testKey);
    } catch (error) {
      errors.push(`Cache operation failed: ${error.message}`);
      latency = Date.now() - startTime;
    }

    // 获取缓存统计
    const stats = this.cacheService.getStats();

    // 确定健康状态
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (!isConnected) {
      status = 'unhealthy';
    } else if (errors.length > 0 || latency > 1000) {
      // 延迟超过1秒认为是降级
      status = 'degraded';
    }

    const healthStatus: CacheHealthStatus = {
      status,
      latency,
      isConnected,
      stats,
      errors,
      lastCheck: new Date(),
      uptime: Date.now() - this.healthCheckStartTime,
    };

    this.lastHealthCheck = healthStatus;

    // 记录健康状态
    if (status === 'healthy') {
      this.logger.debug(`Cache health check passed (latency: ${latency}ms)`);
    } else {
      this.logger.warn(`Cache health check ${status}: ${errors.join(', ')}`);
    }

    return healthStatus;
  }

  /**
   * 获取最后一次健康检查结果
   */
  getLastHealthCheck(): CacheHealthStatus | null {
    return this.lastHealthCheck;
  }

  /**
   * 获取缓存性能指标
   */
  async getPerformanceMetrics(): Promise<{
    hitRate: number;
    averageLatency: number;
    totalOperations: number;
    cacheSize: number;
    memoryUsage: number;
  }> {
    const stats = this.cacheService.getStats();

    return {
      hitRate: stats.hitRate,
      averageLatency: stats.averageResponseTime,
      totalOperations: stats.totalOperations,
      cacheSize: 0, // 需要Redis info命令获取
      memoryUsage: 0, // 需要Redis info命令获取
    };
  }

  /**
   * 获取缓存配置信息
   */
  getCacheConfig(): any {
    return {
      enabled: this.configService.get('cache.performance.enabled'),
      defaultTtl: this.configService.get('cache.strategies.default.ttl'),
      maxKeys: this.configService.get('cache.strategies.default.max'),
      redisHost: this.configService.get('cache.redis.host'),
      redisPort: this.configService.get('cache.redis.port'),
      keyPrefix: this.configService.get('cache.redis.keyPrefix'),
    };
  }

  /**
   * 重置健康检查统计
   */
  resetHealthStats(): void {
    this.healthCheckStartTime = Date.now();
    this.lastHealthCheck = null;
    this.cacheService.resetStats();
    this.logger.log('Cache health stats reset');
  }

  /**
   * 预热缓存
   */
  async warmupCache(): Promise<void> {
    const preloadConfig = this.configService.get('cache.performance.preload');

    if (!preloadConfig.enabled || !preloadConfig.keys.length) {
      this.logger.debug('Cache preload disabled or no keys configured');
      return;
    }

    this.logger.log(
      `Starting cache warmup for ${preloadConfig.keys.length} keys`,
    );

    try {
      for (const key of preloadConfig.keys) {
        // 这里可以根据key的类型预加载不同的数据
        // 例如：预加载用户数据、权限数据等
        await this.preloadKey(key);
      }

      this.logger.log('Cache warmup completed');
    } catch (error) {
      this.logger.error('Cache warmup failed:', error);
    }
  }

  /**
   * 预加载单个键
   */
  private async preloadKey(key: string): Promise<void> {
    try {
      // 检查缓存是否已存在
      const exists = await this.cacheService.exists(key);
      if (exists) {
        this.logger.debug(`Cache key already exists: ${key}`);
        return;
      }

      // 这里应该根据key的类型从数据库或其他数据源加载数据
      // 示例：
      // if (key.startsWith('user:')) {
      //   const userId = key.split(':')[1];
      //   const userData = await this.userService.findById(userId);
      //   await this.cacheService.set(key, userData);
      // }

      this.logger.debug(`Preloaded cache key: ${key}`);
    } catch (error) {
      this.logger.warn(`Failed to preload cache key ${key}:`, error);
    }
  }
}

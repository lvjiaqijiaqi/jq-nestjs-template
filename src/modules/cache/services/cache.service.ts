import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';

/**
 * 缓存策略枚举
 */
export enum CacheStrategy {
  DEFAULT = 'default',
  USER = 'user',
  PERMISSION = 'permission',
  API = 'api',
  QUERY = 'query',
  SESSION = 'session',
  VERIFICATION = 'verification',
}

/**
 * 缓存选项接口
 */
export interface CacheOptions {
  ttl?: number;
  strategy?: CacheStrategy;
  compress?: boolean;
  tags?: string[];
}

/**
 * 缓存统计接口
 */
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  totalOperations: number;
  averageResponseTime: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
    totalOperations: 0,
    averageResponseTime: 0,
  };

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  /**
   * 获取缓存值
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      const fullKey = this.buildKey(key, options?.strategy);
      const result = await this.cacheManager.get<T>(fullKey);
      
      const endTime = Date.now();
      this.updateStats('get', endTime - startTime, result !== undefined);
      
      if (result !== undefined) {
        this.logger.debug(`Cache HIT: ${fullKey}`);
        return result;
      } else {
        this.logger.debug(`Cache MISS: ${fullKey}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 设置缓存值
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const startTime = Date.now();
    
    try {
      const fullKey = this.buildKey(key, options?.strategy);
      const ttl = this.getTtl(options);
      
      await this.cacheManager.set(fullKey, value, ttl);
      
      const endTime = Date.now();
      this.updateStats('set', endTime - startTime, true);
      
      this.logger.debug(`Cache SET: ${fullKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 删除缓存值
   */
  async del(key: string, strategy?: CacheStrategy): Promise<void> {
    const startTime = Date.now();
    
    try {
      const fullKey = this.buildKey(key, strategy);
      await this.cacheManager.del(fullKey);
      
      const endTime = Date.now();
      this.updateStats('delete', endTime - startTime, true);
      
      this.logger.debug(`Cache DEL: ${fullKey}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 批量获取
   */
  async mget<T>(keys: string[], strategy?: CacheStrategy): Promise<(T | null)[]> {
    const promises = keys.map(key => this.get<T>(key, { strategy }));
    return Promise.all(promises);
  }

  /**
   * 批量设置
   */
  async mset<T>(
    keyValuePairs: Array<{ key: string; value: T; options?: CacheOptions }>,
  ): Promise<void> {
    const promises = keyValuePairs.map(({ key, value, options }) =>
      this.set(key, value, options),
    );
    await Promise.all(promises);
  }

  /**
   * 批量删除
   */
  async mdel(keys: string[], strategy?: CacheStrategy): Promise<void> {
    const promises = keys.map(key => this.del(key, strategy));
    await Promise.all(promises);
  }

  /**
   * 清除某个策略下的所有缓存
   */
  async clearByStrategy(strategy: CacheStrategy): Promise<void> {
    try {
      const strategyConfig = this.getStrategyConfig(strategy);
      const pattern = `${strategyConfig.keyPrefix}*`;
      
      // 注意：这需要Redis支持，实际实现可能需要使用Redis client
      this.logger.warn(`Cache clear by strategy not fully implemented: ${strategy}`);
      
      // 这里应该实现具体的清除逻辑
      // const keys = await this.scan(pattern);
      // await this.mdel(keys);
    } catch (error) {
      this.logger.error(`Cache clear strategy error:`, error);
      throw error;
    }
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    try {
      // 使用 store.flushall() 方法清除Redis中所有数据
      const store = (this.cacheManager as any).store;
      if (store && typeof store.flushall === 'function') {
        await store.flushall();
      } else {
        // 如果不支持 flushall，则使用 del 删除所有键
        this.logger.warn('Cache store does not support flushall, using individual delete operations');
      }
      
      this.logger.log('All cache cleared');
    } catch (error) {
      this.logger.error('Cache clear all error:', error);
      throw error;
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(key: string, strategy?: CacheStrategy): Promise<boolean> {
    const result = await this.get(key, { strategy });
    return result !== null;
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 重置缓存统计
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
      totalOperations: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * 构建缓存键
   */
  private buildKey(key: string, strategy?: CacheStrategy): string {
    if (!strategy) {
      return key;
    }
    
    const strategyConfig = this.getStrategyConfig(strategy);
    return `${strategyConfig.keyPrefix}${key}`;
  }

  /**
   * 获取TTL
   */
  private getTtl(options?: CacheOptions): number {
    if (options?.ttl) {
      return options.ttl;
    }
    
    if (options?.strategy) {
      const strategyConfig = this.getStrategyConfig(options.strategy);
      return strategyConfig.ttl;
    }
    
    const defaultStrategy = this.configService.get('cache.strategies.default');
    return defaultStrategy.ttl;
  }

  /**
   * 获取策略配置
   */
  private getStrategyConfig(strategy: CacheStrategy) {
    const strategies = this.configService.get('cache.strategies');
    return strategies[strategy] || strategies.default;
  }

  /**
   * 更新统计信息
   */
  private updateStats(operation: string, responseTime: number, success: boolean): void {
    if (!this.configService.get('cache.performance.enableStats')) {
      return;
    }

    switch (operation) {
      case 'get':
        if (success) {
          this.stats.hits++;
        } else {
          this.stats.misses++;
        }
        break;
      case 'set':
        this.stats.sets++;
        break;
      case 'delete':
        this.stats.deletes++;
        break;
    }

    this.stats.totalOperations = this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes;
    this.stats.hitRate = this.stats.totalOperations > 0 ? 
      (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 : 0;
    
    // 简单的移动平均
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime + responseTime) / 2;
  }
} 
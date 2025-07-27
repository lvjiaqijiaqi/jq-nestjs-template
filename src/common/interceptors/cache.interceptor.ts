import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../../modules/cache/services/cache.service';
import {
  CACHE_KEY_METADATA,
  CACHE_OPTIONS_METADATA,
  CacheKeyGenerator,
  CacheDecoratorOptions,
} from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // 获取缓存配置
    const cacheOptions = this.reflector.getAllAndOverride<CacheDecoratorOptions>(
      CACHE_OPTIONS_METADATA,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有缓存配置，直接执行
    if (!cacheOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const args = context.getArgs();

    // 生成缓存键
    const cacheKey = this.generateCacheKey(className, methodName, args, cacheOptions);

    // 检查条件
    if (cacheOptions.condition && !cacheOptions.condition(args)) {
      this.logger.debug(`Cache condition not met for key: ${cacheKey}`);
      return next.handle();
    }

    if (cacheOptions.unless && cacheOptions.unless(args)) {
      this.logger.debug(`Cache unless condition met for key: ${cacheKey}`);
      return next.handle();
    }

    try {
      // 尝试从缓存获取
      const cachedResult = await this.cacheService.get(cacheKey, {
        strategy: cacheOptions.strategy,
      });

      if (cachedResult !== null) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`);
        return of(cachedResult);
      }

      // 缓存未命中，执行原方法并缓存结果
      this.logger.debug(`Cache miss for key: ${cacheKey}`);
      
      return next.handle().pipe(
        tap(async (result) => {
          // 检查结果条件
          if (cacheOptions.condition && !cacheOptions.condition(args, result)) {
            return;
          }

          if (cacheOptions.unless && cacheOptions.unless(args, result)) {
            return;
          }

          // 缓存结果
          try {
            await this.cacheService.set(cacheKey, result, cacheOptions);
            this.logger.debug(`Cached result for key: ${cacheKey}`);
          } catch (error) {
            this.logger.error(`Failed to cache result for key ${cacheKey}:`, error);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache operation failed for key ${cacheKey}:`, error);
      // 缓存失败时直接执行原方法
      return next.handle();
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(
    className: string,
    methodName: string,
    args: any[],
    options: CacheDecoratorOptions,
  ): string {
    const keyTemplate = this.reflector.getAllAndOverride<string | ((args: any[]) => string)>(
      CACHE_KEY_METADATA,
      [args[0], args[1]], // handler, class
    ) || options.key;

    return CacheKeyGenerator.generate(className, methodName, args, keyTemplate);
  }
}

/**
 * 缓存失效拦截器
 */
@Injectable()
export class CacheEvictInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheEvictInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const evictOptions = this.reflector.getAllAndOverride('cache_evict', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!evictOptions) {
      return next.handle();
    }

    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const args = context.getArgs();

    // 如果是方法执行前清除缓存
    if (evictOptions.beforeInvocation) {
      this.evictCache(className, methodName, args, evictOptions);
    }

    return next.handle().pipe(
      tap(async (result) => {
        // 方法执行后清除缓存
        if (!evictOptions.beforeInvocation) {
          // 检查条件
          if (evictOptions.condition && !evictOptions.condition(args, result)) {
            return;
          }

          await this.evictCache(className, methodName, args, evictOptions);
        }
      }),
    );
  }

  /**
   * 清除缓存
   */
  private async evictCache(
    className: string,
    methodName: string,
    args: any[],
    options: any,
  ): Promise<void> {
    try {
      if (options.allEntries) {
        // 清除所有缓存
        if (options.strategy) {
          await this.cacheService.clearByStrategy(options.strategy);
        } else {
          await this.cacheService.clear();
        }
        this.logger.debug(`Evicted all cache entries`);
        return;
      }

      // 生成要清除的键
      let keysToEvict: string[] = [];

      if (typeof options.key === 'function') {
        const keys = options.key(args);
        keysToEvict = Array.isArray(keys) ? keys : [keys];
      } else if (Array.isArray(options.key)) {
        keysToEvict = options.key;
      } else if (typeof options.key === 'string') {
        keysToEvict = [options.key];
      } else {
        // 默认键生成
        const defaultKey = CacheKeyGenerator.generate(className, methodName, args);
        keysToEvict = [defaultKey];
      }

      // 批量删除
      await this.cacheService.mdel(keysToEvict, options.strategy);
      this.logger.debug(`Evicted cache keys: ${keysToEvict.join(', ')}`);
    } catch (error) {
      this.logger.error('Cache eviction failed:', error);
    }
  }
}

/**
 * 缓存更新拦截器
 */
@Injectable()
export class CachePutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CachePutInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const putOptions = this.reflector.getAllAndOverride<CacheDecoratorOptions>('cache_put', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!putOptions) {
      return next.handle();
    }

    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const args = context.getArgs();

    return next.handle().pipe(
      tap(async (result) => {
        // 检查条件
        if (putOptions.condition && !putOptions.condition(args, result)) {
          return;
        }

        if (putOptions.unless && putOptions.unless(args, result)) {
          return;
        }

        try {
          // 生成缓存键
          const cacheKey = CacheKeyGenerator.generate(className, methodName, args, putOptions.key);
          
          // 更新缓存
          await this.cacheService.set(cacheKey, result, putOptions);
          this.logger.debug(`Updated cache for key: ${cacheKey}`);
        } catch (error) {
          this.logger.error('Cache put failed:', error);
        }
      }),
    );
  }
} 
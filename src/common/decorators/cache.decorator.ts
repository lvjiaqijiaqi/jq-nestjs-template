import { applyDecorators, SetMetadata } from '@nestjs/common';
import { CacheStrategy, CacheOptions } from '../../modules/cache/services/cache.service';

// 缓存元数据键
export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_OPTIONS_METADATA = 'cache_options';

/**
 * 缓存装饰器选项
 */
export interface CacheDecoratorOptions extends CacheOptions {
  key?: string | ((args: any[]) => string);
  condition?: (args: any[], result?: any) => boolean;
  unless?: (args: any[], result?: any) => boolean;
}

/**
 * 缓存装饰器
 * 自动缓存方法返回值
 */
export function Cacheable(options: CacheDecoratorOptions = {}) {
  return applyDecorators(
    SetMetadata(CACHE_KEY_METADATA, options.key),
    SetMetadata(CACHE_OPTIONS_METADATA, options),
  );
}

/**
 * 缓存失效装饰器
 * 在方法执行后清除指定的缓存
 */
export function CacheEvict(options: {
  key?: string | string[] | ((args: any[]) => string | string[]);
  strategy?: CacheStrategy;
  allEntries?: boolean;
  beforeInvocation?: boolean;
  condition?: (args: any[], result?: any) => boolean;
} = {}) {
  return SetMetadata('cache_evict', options);
}

/**
 * 缓存更新装饰器
 * 在方法执行后更新缓存
 */
export function CachePut(options: CacheDecoratorOptions = {}) {
  return SetMetadata('cache_put', options);
}

/**
 * 缓存配置装饰器
 * 为整个类配置缓存策略
 */
export function CacheConfig(options: {
  strategy?: CacheStrategy;
  keyPrefix?: string;
  ttl?: number;
}) {
  return SetMetadata('cache_config', options);
}

/**
 * 生成缓存键的辅助函数
 */
export class CacheKeyGenerator {
  /**
   * 根据类名、方法名和参数生成缓存键
   */
  static generate(
    className: string,
    methodName: string,
    args: any[],
    keyTemplate?: string | ((args: any[]) => string),
  ): string {
    if (typeof keyTemplate === 'function') {
      return keyTemplate(args);
    }
    
    if (typeof keyTemplate === 'string') {
      return this.interpolateKey(keyTemplate, args);
    }
    
    // 默认键生成策略
    const argsString = args.length > 0 ? 
      ':' + args.map(arg => this.serializeArg(arg)).join(':') : '';
    
    return `${className}:${methodName}${argsString}`;
  }

  /**
   * 插值替换键模板
   */
  private static interpolateKey(template: string, args: any[]): string {
    return template.replace(/\{(\d+)\}/g, (match, index) => {
      const argIndex = parseInt(index, 10);
      return argIndex < args.length ? this.serializeArg(args[argIndex]) : match;
    });
  }

  /**
   * 序列化参数
   */
  private static serializeArg(arg: any): string {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number') return arg.toString();
    if (typeof arg === 'boolean') return arg.toString();
    if (typeof arg === 'object') {
      if (arg.id) return arg.id.toString();
      if (arg.toString !== Object.prototype.toString) return arg.toString();
      return JSON.stringify(arg);
    }
    return String(arg);
  }
}

/**
 * 缓存条件辅助函数
 */
export class CacheConditions {
  /**
   * 总是缓存
   */
  static always(): boolean {
    return true;
  }

  /**
   * 从不缓存
   */
  static never(): boolean {
    return false;
  }

  /**
   * 当结果不为空时缓存
   */
  static whenResultNotEmpty(args: any[], result?: any): boolean {
    if (result === null || result === undefined) return false;
    if (Array.isArray(result)) return result.length > 0;
    if (typeof result === 'object') return Object.keys(result).length > 0;
    return Boolean(result);
  }

  /**
   * 当参数满足条件时缓存
   */
  static whenArg(index: number, predicate: (arg: any) => boolean) {
    return (args: any[]) => {
      return index < args.length && predicate(args[index]);
    };
  }

  /**
   * 组合多个条件（AND）
   */
  static and(...conditions: ((args: any[], result?: any) => boolean)[]) {
    return (args: any[], result?: any) => {
      return conditions.every(condition => condition(args, result));
    };
  }

  /**
   * 组合多个条件（OR）
   */
  static or(...conditions: ((args: any[], result?: any) => boolean)[]) {
    return (args: any[], result?: any) => {
      return conditions.some(condition => condition(args, result));
    };
  }
}

/**
 * 常用缓存策略预设
 */
export const CachePresets = {
  /**
   * 短期缓存（1分钟）
   */
  SHORT_TERM: {
    ttl: 60,
    strategy: CacheStrategy.DEFAULT,
  },

  /**
   * 中期缓存（5分钟）
   */
  MEDIUM_TERM: {
    ttl: 300,
    strategy: CacheStrategy.DEFAULT,
  },

  /**
   * 长期缓存（30分钟）
   */
  LONG_TERM: {
    ttl: 1800,
    strategy: CacheStrategy.DEFAULT,
  },

  /**
   * 用户数据缓存
   */
  USER_DATA: {
    ttl: 600,
    strategy: CacheStrategy.USER,
  },

  /**
   * 权限数据缓存
   */
  PERMISSION_DATA: {
    ttl: 1800,
    strategy: CacheStrategy.PERMISSION,
  },

  /**
   * API响应缓存
   */
  API_RESPONSE: {
    ttl: 120,
    strategy: CacheStrategy.API,
  },

  /**
   * 数据库查询缓存
   */
  DATABASE_QUERY: {
    ttl: 60,
    strategy: CacheStrategy.QUERY,
  },
} as const; 
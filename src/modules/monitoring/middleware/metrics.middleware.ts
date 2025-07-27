import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../services/metrics.service';

/**
 * 扩展Request接口，添加监控相关属性
 */
export interface MonitoredRequest extends Request {
  _startTime?: [number, number];
  _requestSize?: number;
  _responseSize?: number;
  _routePath?: string;
}

/**
 * HTTP指标收集中间件
 */
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MetricsMiddleware.name);
  private readonly excludePaths: Set<string>;
  private readonly pathNormalization: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {
    const config = this.configService.get('monitoring.metrics.httpMetrics');
    this.excludePaths = new Set(config.excludePaths || []);
    this.pathNormalization = config.pathNormalization || false;
  }

  use(req: MonitoredRequest, res: Response, next: NextFunction) {
    // 检查是否启用HTTP指标收集
    const config = this.configService.get('monitoring.metrics');
    if (!config.enabled || !config.httpMetrics.enabled) {
      return next();
    }

    // 检查是否在排除路径中
    if (this.excludePaths.has(req.path)) {
      return next();
    }

    // 记录请求开始时间
    req._startTime = process.hrtime();

    // 记录请求大小
    req._requestSize = this.getRequestSize(req);

    // 获取路由路径
    req._routePath = this.normalizeRoute(req);

    // 监听响应结束事件
    res.on('finish', () => {
      this.recordMetrics(req, res);
    });

    next();
  }

  /**
   * 记录HTTP指标
   */
  private recordMetrics(req: MonitoredRequest, res: Response) {
    try {
      // 计算请求持续时间
      const duration = req._startTime
        ? this.calculateDuration(req._startTime)
        : 0;

      // 获取路由路径
      const route = req._routePath || this.normalizeRoute(req);

      // 获取响应大小
      const responseSize = this.getResponseSize(res);

      // 记录指标
      this.metricsService.recordHttpRequest(
        req.method,
        route,
        res.statusCode,
        duration,
        req._requestSize,
        responseSize,
      );

      // 记录详细日志（仅在开发环境）
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(
          `HTTP ${req.method} ${route} ${res.statusCode} - ${duration}ms - ${req._requestSize || 0}B/${responseSize || 0}B`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to record HTTP metrics:', error);
    }
  }

  /**
   * 计算请求持续时间（毫秒）
   */
  private calculateDuration(startTime: [number, number]): number {
    const diff = process.hrtime(startTime);
    return diff[0] * 1000 + diff[1] * 1e-6; // 转换为毫秒
  }

  /**
   * 获取请求大小
   */
  private getRequestSize(req: MonitoredRequest): number {
    try {
      const contentLength = req.get('content-length');
      if (contentLength) {
        return parseInt(contentLength, 10);
      }

      // 如果没有content-length头，尝试从body估算
      if (req.body) {
        if (typeof req.body === 'string') {
          return Buffer.byteLength(req.body, 'utf8');
        } else if (typeof req.body === 'object') {
          return Buffer.byteLength(JSON.stringify(req.body), 'utf8');
        }
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 获取响应大小
   */
  private getResponseSize(res: Response): number {
    try {
      const contentLength = res.get('content-length');
      if (contentLength) {
        return parseInt(contentLength, 10);
      }

      // 如果没有content-length，尝试从其他方式获取
      // 注意：这可能不准确，因为响应可能已经被压缩
      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 标准化路由路径
   */
  private normalizeRoute(req: MonitoredRequest): string {
    if (!this.pathNormalization) {
      return req.path;
    }

    // 基本的路径标准化
    let route = req.path;

    // 替换数字ID为占位符
    route = route.replace(/\/\d+/g, '/:id');

    // 替换UUID为占位符
    route = route.replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '/:uuid',
    );

    // 替换其他常见模式
    route = route.replace(/\/[a-f0-9]{24}/g, '/:objectid'); // MongoDB ObjectId
    route = route.replace(/\/[a-zA-Z0-9_-]{10,}/g, '/:token'); // 长token

    return route;
  }
}

/**
 * HTTP活跃连接追踪中间件
 */
@Injectable()
export class ActiveConnectionsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ActiveConnectionsMiddleware.name);
  private activeConnections = 0;

  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 增加活跃连接数
    this.activeConnections++;
    this.metricsService.setActiveConnections(this.activeConnections);

    // 监听连接关闭
    res.on('finish', () => {
      this.activeConnections--;
      this.metricsService.setActiveConnections(this.activeConnections);
    });

    res.on('close', () => {
      this.activeConnections--;
      this.metricsService.setActiveConnections(this.activeConnections);
    });

    next();
  }
}

/**
 * 错误率追踪中间件
 */
@Injectable()
export class ErrorRateMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ErrorRateMiddleware.name);
  private readonly errorCounter: Map<string, number> = new Map();
  private readonly requestCounter: Map<string, number> = new Map();
  private readonly windowSize = 60000; // 1分钟窗口

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {
    // 定期清理计数器
    setInterval(() => {
      this.cleanupCounters();
    }, this.windowSize);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const route = req.path;
    const minute = Math.floor(Date.now() / this.windowSize);
    const key = `${route}:${minute}`;

    // 增加请求计数
    this.requestCounter.set(key, (this.requestCounter.get(key) || 0) + 1);

    // 监听响应
    res.on('finish', () => {
      // 如果是错误响应（4xx, 5xx），增加错误计数
      if (res.statusCode >= 400) {
        this.errorCounter.set(key, (this.errorCounter.get(key) || 0) + 1);
      }

      // 检查错误率
      this.checkErrorRate(route, minute);
    });

    next();
  }

  /**
   * 检查错误率
   */
  private checkErrorRate(route: string, minute: number) {
    const key = `${route}:${minute}`;
    const errors = this.errorCounter.get(key) || 0;
    const requests = this.requestCounter.get(key) || 0;

    if (requests > 10) {
      // 只在有足够请求时检查
      const errorRate = errors / requests;
      const thresholds = this.configService.get(
        'monitoring.thresholds.errorRate',
      );

      if (errorRate >= thresholds.critical) {
        this.logger.error(
          `Critical error rate detected: ${(errorRate * 100).toFixed(2)}% for ${route}`,
        );
      } else if (errorRate >= thresholds.warning) {
        this.logger.warn(
          `High error rate detected: ${(errorRate * 100).toFixed(2)}% for ${route}`,
        );
      }
    }
  }

  /**
   * 清理过期计数器
   */
  private cleanupCounters() {
    const currentMinute = Math.floor(Date.now() / this.windowSize);
    const cutoff = currentMinute - 5; // 保留最近5分钟

    for (const key of this.errorCounter.keys()) {
      const parts = key.split(':');
      const minuteStr = parts[parts.length - 1];
      if (minuteStr) {
        const minute = parseInt(minuteStr, 10);
        if (minute < cutoff) {
          this.errorCounter.delete(key);
        }
      }
    }

    for (const key of this.requestCounter.keys()) {
      const parts = key.split(':');
      const minuteStr = parts[parts.length - 1];
      if (minuteStr) {
        const minute = parseInt(minuteStr, 10);
        if (minute < cutoff) {
          this.requestCounter.delete(key);
        }
      }
    }
  }

  /**
   * 获取当前错误率统计
   */
  getErrorRateStats(): Array<{
    route: string;
    errorRate: number;
    requests: number;
    errors: number;
  }> {
    const stats: Array<{
      route: string;
      errorRate: number;
      requests: number;
      errors: number;
    }> = [];
    const currentMinute = Math.floor(Date.now() / this.windowSize);

    // 聚合最近5分钟的数据
    const routeStats: Map<string, { requests: number; errors: number }> =
      new Map();

    for (let i = 0; i < 5; i++) {
      const minute = currentMinute - i;

      for (const [key, requests] of this.requestCounter.entries()) {
        const [route, keyMinute] = key.split(':');
        if (parseInt(keyMinute, 10) === minute) {
          const current = routeStats.get(route) || { requests: 0, errors: 0 };
          current.requests += requests;

          const errorKey = `${route}:${minute}`;
          current.errors += this.errorCounter.get(errorKey) || 0;

          routeStats.set(route, current);
        }
      }
    }

    for (const [route, data] of routeStats.entries()) {
      if (data.requests > 0) {
        stats.push({
          route,
          errorRate: data.errors / data.requests,
          requests: data.requests,
          errors: data.errors,
        });
      }
    }

    return stats.sort((a, b) => b.errorRate - a.errorRate);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  HealthIndicatorFunction,
  HealthIndicatorResult,
  HealthCheckService as NestHealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { QueueService } from '../../queue/services/queue.service';
import { CacheService } from '../../cache/services/cache.service';
import * as os from 'os';
import * as fs from 'fs';

/**
 * 健康状态枚举
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

/**
 * 健康检查结果接口
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    [key: string]: {
      status: HealthStatus;
      message?: string;
      data?: any;
      duration?: number;
    };
  };
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

/**
 * 依赖服务健康状态
 */
export interface DependencyHealth {
  name: string;
  status: HealthStatus;
  responseTime: number;
  details?: any;
}

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: ConfigService,
    private readonly nestHealthCheck: NestHealthCheckService,
    private readonly typeOrmHealth: TypeOrmHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly diskHealth: DiskHealthIndicator,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly queueService: QueueService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 执行全面的健康检查
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const monitoringConfig = this.configService.get('monitoring');
    const checks: any = {};
    let overallStatus = HealthStatus.HEALTHY;

    try {
      // 基础系统信息
      const systemInfo = this.getSystemInfo();

      // 执行各项健康检查
      if (monitoringConfig.healthCheck.checks.database) {
        checks.database = await this.checkDatabase();
      }

      if (monitoringConfig.healthCheck.checks.redis) {
        checks.redis = await this.checkRedis();
      }

      if (monitoringConfig.healthCheck.checks.queue) {
        checks.queue = await this.checkQueue();
      }

      if (monitoringConfig.healthCheck.checks.memory) {
        checks.memory = await this.checkMemory();
      }

      if (monitoringConfig.healthCheck.checks.disk) {
        checks.disk = await this.checkDisk();
      }

      // 检查外部依赖
      if (monitoringConfig.healthCheck.checks.external) {
        checks.external = await this.checkExternalDependencies();
      }

      // 计算整体状态
      const summary = this.calculateSummary(checks);
      if (summary.unhealthy > 0) {
        overallStatus = HealthStatus.UNHEALTHY;
      } else if (summary.degraded > 0) {
        overallStatus = HealthStatus.DEGRADED;
      }

      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: systemInfo.version,
        environment: systemInfo.environment,
        checks,
        summary,
      };

      const duration = Date.now() - startTime;
      this.logger.log(`Health check completed in ${duration}ms - Status: ${overallStatus}`);

      return result;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: 'unknown',
        environment: 'unknown',
        checks: { error: { status: HealthStatus.UNHEALTHY, message: error.message } },
        summary: { total: 1, healthy: 0, degraded: 0, unhealthy: 1 },
      };
    }
  }

  /**
   * 获取简化的健康状态
   */
  async getQuickHealthCheck(): Promise<{ status: HealthStatus; message: string }> {
    try {
      const result = await this.performHealthCheck();
      return {
        status: result.status,
        message: `${result.summary.healthy}/${result.summary.total} checks passing`,
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: 'Health check failed',
      };
    }
  }

  /**
   * 检查数据库健康状态
   */
  private async checkDatabase(): Promise<any> {
    const startTime = Date.now();
    try {
      // 检查数据库连接
      await this.dataSource.query('SELECT 1');
      
      // 检查连接池状态
      const poolStats = this.getConnectionPoolStats();
      
      const duration = Date.now() - startTime;
      const status = duration > 1000 ? HealthStatus.DEGRADED : HealthStatus.HEALTHY;
      
      return {
        status,
        message: `Database responsive in ${duration}ms`,
        duration,
        data: {
          type: this.dataSource.options.type,
          host: (this.dataSource.options as any).host || 'localhost',
          database: (this.dataSource.options as any).database || 'default',
          pool: poolStats,
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Database connection failed: ${error.message}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 检查Redis健康状态
   */
  private async checkRedis(): Promise<any> {
    const startTime = Date.now();
    try {
      // 尝试缓存操作
      const testKey = 'health_check_test';
      const testValue = Date.now().toString();
      
      await this.cacheService.set(testKey, testValue, { ttl: 10 });
      const retrievedValue = await this.cacheService.get(testKey);
      await this.cacheService.del(testKey);
      
      const duration = Date.now() - startTime;
      const isValid = retrievedValue === testValue;
      const status = !isValid ? HealthStatus.UNHEALTHY : 
                   duration > 500 ? HealthStatus.DEGRADED : HealthStatus.HEALTHY;
      
      return {
        status,
        message: `Redis responsive in ${duration}ms`,
        duration,
        data: {
          cacheStats: this.cacheService.getStats(),
          testPassed: isValid,
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Redis connection failed: ${error.message}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 检查队列健康状态
   */
  private async checkQueue(): Promise<any> {
    const startTime = Date.now();
    try {
      const queueStats = await this.queueService.getAllQueueStats();
      let status = HealthStatus.HEALTHY;
      const issues: string[] = [];
      
      // 检查队列积压情况
      const thresholds = this.configService.get('monitoring.thresholds');
      Object.entries(queueStats).forEach(([queueName, stats]: [string, any]) => {
        if (stats.waiting > thresholds.queueBacklog.critical) {
          status = HealthStatus.UNHEALTHY;
          issues.push(`${queueName} queue critical backlog: ${stats.waiting}`);
        } else if (stats.waiting > thresholds.queueBacklog.warning) {
          if (status === HealthStatus.HEALTHY) status = HealthStatus.DEGRADED;
          issues.push(`${queueName} queue warning backlog: ${stats.waiting}`);
        }
      });
      
      const duration = Date.now() - startTime;
      return {
        status,
        message: issues.length > 0 ? issues.join('; ') : `All queues healthy in ${duration}ms`,
        duration,
        data: queueStats,
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Queue check failed: ${error.message}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 检查内存使用情况
   */
  private async checkMemory(): Promise<any> {
    const startTime = Date.now();
    try {
      const memInfo = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMemPercent = (totalMem - freeMem) / totalMem;
      
      const thresholds = this.configService.get('monitoring.thresholds.memory');
      let status = HealthStatus.HEALTHY;
      let message = `Memory usage: ${(usedMemPercent * 100).toFixed(1)}%`;
      
      if (usedMemPercent > thresholds.critical) {
        status = HealthStatus.UNHEALTHY;
        message += ' (Critical)';
      } else if (usedMemPercent > thresholds.warning) {
        status = HealthStatus.DEGRADED;
        message += ' (Warning)';
      }
      
      const duration = Date.now() - startTime;
      return {
        status,
        message,
        duration,
        data: {
          process: {
            rss: Math.round(memInfo.rss / 1024 / 1024),
            heapUsed: Math.round(memInfo.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memInfo.heapTotal / 1024 / 1024),
            external: Math.round(memInfo.external / 1024 / 1024),
          },
          system: {
            total: Math.round(totalMem / 1024 / 1024),
            free: Math.round(freeMem / 1024 / 1024),
            usedPercent: Math.round(usedMemPercent * 100),
          },
        },
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Memory check failed: ${error.message}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 检查磁盘使用情况
   */
  private async checkDisk(): Promise<any> {
    const startTime = Date.now();
    try {
      const stats = fs.statSync('.');
      const diskInfo = await this.getDiskUsage();
      
      const thresholds = this.configService.get('monitoring.thresholds.disk');
      let status = HealthStatus.HEALTHY;
      let message = `Disk usage: ${diskInfo.usedPercent.toFixed(1)}%`;
      
      if (diskInfo.usedPercent > thresholds.critical * 100) {
        status = HealthStatus.UNHEALTHY;
        message += ' (Critical)';
      } else if (diskInfo.usedPercent > thresholds.warning * 100) {
        status = HealthStatus.DEGRADED;
        message += ' (Warning)';
      }
      
      const duration = Date.now() - startTime;
      return {
        status,
        message,
        duration,
        data: diskInfo,
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Disk check failed: ${error.message}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * 检查外部依赖
   */
  private async checkExternalDependencies(): Promise<any> {
    const startTime = Date.now();
    // 这里可以添加对外部API、服务的健康检查
    const dependencies: DependencyHealth[] = [];
    
    // 示例：检查外部API
    // try {
    //   const response = await axios.get('https://api.example.com/health', { timeout: 5000 });
    //   dependencies.push({
    //     name: 'External API',
    //     status: response.status === 200 ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
    //     responseTime: Date.now() - startTime,
    //     details: { statusCode: response.status }
    //   });
    // } catch (error) {
    //   dependencies.push({
    //     name: 'External API',
    //     status: HealthStatus.UNHEALTHY,
    //     responseTime: Date.now() - startTime,
    //     details: { error: error.message }
    //   });
    // }
    
    const overallStatus = dependencies.every(dep => dep.status === HealthStatus.HEALTHY) 
      ? HealthStatus.HEALTHY 
      : HealthStatus.DEGRADED;
    
    const duration = Date.now() - startTime;
    return {
      status: overallStatus,
      message: `Checked ${dependencies.length} external dependencies`,
      duration,
      data: dependencies,
    };
  }

  /**
   * 获取系统基础信息
   */
  private getSystemInfo() {
    return {
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      pid: process.pid,
      uptime: process.uptime(),
    };
  }

  /**
   * 获取数据库连接池状态
   */
  private getConnectionPoolStats() {
    // 这里需要根据具体的数据库驱动来获取连接池信息
    return {
      total: 20, // 总连接数
      active: 2, // 活跃连接数
      idle: 18,  // 空闲连接数
      waiting: 0, // 等待连接数
    };
  }

  /**
   * 获取磁盘使用情况
   */
  private async getDiskUsage(): Promise<any> {
    // 简单的磁盘使用情况检查
    return new Promise((resolve) => {
      fs.stat('.', (err, stats) => {
        if (err) {
          resolve({ usedPercent: 0, total: 0, free: 0, used: 0 });
          return;
        }
        
        // 模拟磁盘使用情况（实际应用中可以使用statvfs或其他方法）
        resolve({
          total: 1000000, // 1TB
          used: 500000,   // 500GB
          free: 500000,   // 500GB
          usedPercent: 50,
        });
      });
    });
  }

  /**
   * 计算健康检查汇总信息
   */
  private calculateSummary(checks: any) {
    const summary = { total: 0, healthy: 0, degraded: 0, unhealthy: 0 };
    
    Object.values(checks).forEach((check: any) => {
      summary.total++;
      switch (check.status) {
        case HealthStatus.HEALTHY:
          summary.healthy++;
          break;
        case HealthStatus.DEGRADED:
          summary.degraded++;
          break;
        case HealthStatus.UNHEALTHY:
          summary.unhealthy++;
          break;
      }
    });
    
    return summary;
  }

  /**
   * 获取活跃度探针（用于Kubernetes等）
   */
  async getLivenessProbe(): Promise<{ alive: boolean }> {
    try {
      // 简单的存活检查
      return { alive: true };
    } catch (error) {
      return { alive: false };
    }
  }

  /**
   * 获取就绪度探针（用于Kubernetes等）
   */
  async getReadinessProbe(): Promise<{ ready: boolean; details?: any }> {
    try {
      const result = await this.getQuickHealthCheck();
      return {
        ready: result.status !== HealthStatus.UNHEALTHY,
        details: { status: result.status, message: result.message },
      };
    } catch (error) {
      return { ready: false, details: { error: error.message } };
    }
  }
} 
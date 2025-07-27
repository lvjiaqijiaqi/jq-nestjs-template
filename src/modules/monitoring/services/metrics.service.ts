import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as prometheus from 'prom-client';
import * as os from 'os';

/**
 * 指标类型枚举
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

/**
 * HTTP指标接口
 */
export interface HttpMetrics {
  requests: prometheus.Counter<string>;
  requestDuration: prometheus.Histogram<string>;
  requestSize: prometheus.Histogram<string>;
  responseSize: prometheus.Histogram<string>;
  activeConnections: prometheus.Gauge<string>;
}

/**
 * 业务指标接口
 */
export interface BusinessMetrics {
  userRegistrations: prometheus.Counter<string>;
  userLogins: prometheus.Counter<string>;
  emailsSent: prometheus.Counter<string>;
  fileUploads: prometheus.Counter<string>;
  queueJobs: prometheus.Counter<string>;
  cacheOperations: prometheus.Counter<string>;
}

/**
 * 系统指标接口
 */
export interface SystemMetrics {
  cpuUsage: prometheus.Gauge<string>;
  memoryUsage: prometheus.Gauge<string>;
  diskUsage: prometheus.Gauge<string>;
  networkIO: prometheus.Counter<string>;
  processUptime: prometheus.Gauge<string>;
}

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);
  private readonly registry: prometheus.Registry;
  private httpMetrics: HttpMetrics;
  private businessMetrics: BusinessMetrics;
  private systemMetrics: SystemMetrics;
  private collectInterval: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {
    this.registry = new prometheus.Registry();
  }

  async onModuleInit() {
    const config = this.configService.get('monitoring.metrics');
    
    if (config.enabled) {
      this.initializeMetrics();
      this.startCollecting();
      this.logger.log('Metrics collection started');
    }
  }

  /**
   * 初始化指标
   */
  private initializeMetrics() {
    const config = this.configService.get('monitoring.metrics');
    
    // 设置默认标签
    this.registry.setDefaultLabels(config.defaultLabels);
    
    // 如果启用默认指标收集
    if (config.collectDefaultMetrics) {
      prometheus.collectDefaultMetrics({
        register: this.registry,
        prefix: config.prefix,
      });
    }

    // 初始化HTTP指标
    this.initializeHttpMetrics();
    
    // 初始化业务指标
    this.initializeBusinessMetrics();
    
    // 初始化系统指标
    this.initializeSystemMetrics();
  }

  /**
   * 初始化HTTP指标
   */
  private initializeHttpMetrics() {
    const prefix = this.configService.get('monitoring.metrics.prefix');

    this.httpMetrics = {
      requests: new prometheus.Counter({
        name: `${prefix}http_requests_total`,
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.registry],
      }),

      requestDuration: new prometheus.Histogram({
        name: `${prefix}http_request_duration_seconds`,
        help: 'HTTP request duration in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry],
      }),

      requestSize: new prometheus.Histogram({
        name: `${prefix}http_request_size_bytes`,
        help: 'HTTP request size in bytes',
        labelNames: ['method', 'route'],
        buckets: [100, 1000, 10000, 100000, 1000000],
        registers: [this.registry],
      }),

      responseSize: new prometheus.Histogram({
        name: `${prefix}http_response_size_bytes`,
        help: 'HTTP response size in bytes',
        labelNames: ['method', 'route'],
        buckets: [100, 1000, 10000, 100000, 1000000],
        registers: [this.registry],
      }),

      activeConnections: new prometheus.Gauge({
        name: `${prefix}http_active_connections`,
        help: 'Number of active HTTP connections',
        registers: [this.registry],
      }),
    };
  }

  /**
   * 初始化业务指标
   */
  private initializeBusinessMetrics() {
    const prefix = this.configService.get('monitoring.metrics.prefix');

    this.businessMetrics = {
      userRegistrations: new prometheus.Counter({
        name: `${prefix}user_registrations_total`,
        help: 'Total number of user registrations',
        labelNames: ['status'],
        registers: [this.registry],
      }),

      userLogins: new prometheus.Counter({
        name: `${prefix}user_logins_total`,
        help: 'Total number of user logins',
        labelNames: ['status', 'method'],
        registers: [this.registry],
      }),

      emailsSent: new prometheus.Counter({
        name: `${prefix}emails_sent_total`,
        help: 'Total number of emails sent',
        labelNames: ['type', 'status'],
        registers: [this.registry],
      }),

      fileUploads: new prometheus.Counter({
        name: `${prefix}file_uploads_total`,
        help: 'Total number of file uploads',
        labelNames: ['type', 'status'],
        registers: [this.registry],
      }),

      queueJobs: new prometheus.Counter({
        name: `${prefix}queue_jobs_total`,
        help: 'Total number of queue jobs',
        labelNames: ['queue', 'job_type', 'status'],
        registers: [this.registry],
      }),

      cacheOperations: new prometheus.Counter({
        name: `${prefix}cache_operations_total`,
        help: 'Total number of cache operations',
        labelNames: ['operation', 'status'],
        registers: [this.registry],
      }),
    };
  }

  /**
   * 初始化系统指标
   */
  private initializeSystemMetrics() {
    const prefix = this.configService.get('monitoring.metrics.prefix');

    this.systemMetrics = {
      cpuUsage: new prometheus.Gauge({
        name: `${prefix}system_cpu_usage_percent`,
        help: 'System CPU usage percentage',
        labelNames: ['core'],
        registers: [this.registry],
      }),

      memoryUsage: new prometheus.Gauge({
        name: `${prefix}system_memory_usage_bytes`,
        help: 'System memory usage in bytes',
        labelNames: ['type'],
        registers: [this.registry],
      }),

      diskUsage: new prometheus.Gauge({
        name: `${prefix}system_disk_usage_bytes`,
        help: 'System disk usage in bytes',
        labelNames: ['mount_point', 'type'],
        registers: [this.registry],
      }),

      networkIO: new prometheus.Counter({
        name: `${prefix}system_network_io_bytes_total`,
        help: 'Total network I/O in bytes',
        labelNames: ['direction'],
        registers: [this.registry],
      }),

      processUptime: new prometheus.Gauge({
        name: `${prefix}process_uptime_seconds`,
        help: 'Process uptime in seconds',
        registers: [this.registry],
      }),
    };
  }

  /**
   * 开始收集指标
   */
  private startCollecting() {
    const config = this.configService.get('monitoring.metrics');
    
    this.collectInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, config.collectInterval);
  }

  /**
   * 收集系统指标
   */
  private collectSystemMetrics() {
    try {
      // CPU使用率
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach((cpu, index) => {
        const cpuTimes = cpu.times;
        const idle = cpuTimes.idle;
        const total = Object.values(cpuTimes).reduce((acc, time) => acc + time, 0);
        
        totalIdle += idle;
        totalTick += total;
        
        const usage = 100 - (idle / total) * 100;
        this.systemMetrics.cpuUsage.set({ core: index.toString() }, usage);
      });
      
      const totalUsage = 100 - (totalIdle / totalTick) * 100;
      this.systemMetrics.cpuUsage.set({ core: 'all' }, totalUsage);

      // 内存使用情况
      const processMemory = process.memoryUsage();
      const systemMemory = {
        total: os.totalmem(),
        free: os.freemem(),
      };

      this.systemMetrics.memoryUsage.set({ type: 'process_rss' }, processMemory.rss);
      this.systemMetrics.memoryUsage.set({ type: 'process_heap_used' }, processMemory.heapUsed);
      this.systemMetrics.memoryUsage.set({ type: 'process_heap_total' }, processMemory.heapTotal);
      this.systemMetrics.memoryUsage.set({ type: 'process_external' }, processMemory.external);
      this.systemMetrics.memoryUsage.set({ type: 'system_total' }, systemMemory.total);
      this.systemMetrics.memoryUsage.set({ type: 'system_free' }, systemMemory.free);
      this.systemMetrics.memoryUsage.set({ type: 'system_used' }, systemMemory.total - systemMemory.free);

      // 进程运行时间
      this.systemMetrics.processUptime.set(process.uptime());

    } catch (error) {
      this.logger.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * 记录HTTP请求指标
   */
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number, requestSize?: number, responseSize?: number) {
    if (!this.httpMetrics) return;

    const labels = { method, route, status_code: statusCode.toString() };
    
    this.httpMetrics.requests.inc(labels);
    this.httpMetrics.requestDuration.observe(labels, duration / 1000); // 转换为秒
    
    if (requestSize !== undefined) {
      this.httpMetrics.requestSize.observe({ method, route }, requestSize);
    }
    
    if (responseSize !== undefined) {
      this.httpMetrics.responseSize.observe({ method, route }, responseSize);
    }
  }

  /**
   * 记录用户注册指标
   */
  recordUserRegistration(status: 'success' | 'failed') {
    if (!this.businessMetrics) return;
    this.businessMetrics.userRegistrations.inc({ status });
  }

  /**
   * 记录用户登录指标
   */
  recordUserLogin(status: 'success' | 'failed', method: 'password' | 'oauth' | 'sso') {
    if (!this.businessMetrics) return;
    this.businessMetrics.userLogins.inc({ status, method });
  }

  /**
   * 记录邮件发送指标
   */
  recordEmailSent(type: 'single' | 'bulk' | 'template', status: 'success' | 'failed') {
    if (!this.businessMetrics) return;
    this.businessMetrics.emailsSent.inc({ type, status });
  }

  /**
   * 记录文件上传指标
   */
  recordFileUpload(type: string, status: 'success' | 'failed') {
    if (!this.businessMetrics) return;
    this.businessMetrics.fileUploads.inc({ type, status });
  }

  /**
   * 记录队列作业指标
   */
  recordQueueJob(queue: string, jobType: string, status: 'completed' | 'failed' | 'retried') {
    if (!this.businessMetrics) return;
    this.businessMetrics.queueJobs.inc({ queue, job_type: jobType, status });
  }

  /**
   * 记录缓存操作指标
   */
  recordCacheOperation(operation: 'get' | 'set' | 'del' | 'clear', status: 'hit' | 'miss' | 'success' | 'error') {
    if (!this.businessMetrics) return;
    this.businessMetrics.cacheOperations.inc({ operation, status });
  }

  /**
   * 设置活跃连接数
   */
  setActiveConnections(count: number) {
    if (!this.httpMetrics) return;
    this.httpMetrics.activeConnections.set(count);
  }

  /**
   * 创建自定义计数器
   */
  createCounter(name: string, help: string, labelNames: string[] = []): prometheus.Counter<string> {
    const prefix = this.configService.get('monitoring.metrics.prefix');
    return new prometheus.Counter({
      name: `${prefix}${name}`,
      help,
      labelNames,
      registers: [this.registry],
    });
  }

  /**
   * 创建自定义仪表盘
   */
  createGauge(name: string, help: string, labelNames: string[] = []): prometheus.Gauge<string> {
    const prefix = this.configService.get('monitoring.metrics.prefix');
    return new prometheus.Gauge({
      name: `${prefix}${name}`,
      help,
      labelNames,
      registers: [this.registry],
    });
  }

  /**
   * 创建自定义直方图
   */
  createHistogram(name: string, help: string, buckets?: number[], labelNames: string[] = []): prometheus.Histogram<string> {
    const prefix = this.configService.get('monitoring.metrics.prefix');
    return new prometheus.Histogram({
      name: `${prefix}${name}`,
      help,
      buckets,
      labelNames,
      registers: [this.registry],
    });
  }

  /**
   * 获取所有指标（Prometheus格式）
   */
  async getMetrics(): Promise<string> {
    try {
      return await this.registry.metrics();
    } catch (error) {
      this.logger.error('Failed to get metrics:', error);
      return '';
    }
  }

  /**
   * 获取指标内容类型
   */
  getContentType(): string {
    return this.registry.contentType;
  }

  /**
   * 重置所有指标
   */
  resetMetrics() {
    this.registry.resetMetrics();
    this.logger.log('All metrics have been reset');
  }

  /**
   * 获取指标摘要
   */
  async getMetricsSummary(): Promise<any> {
    try {
      const metrics = await this.registry.getMetricsAsJSON();
      return {
        totalMetrics: metrics.length,
        metricsByType: metrics.reduce((acc, metric) => {
          acc[metric.type] = (acc[metric.type] || 0) + 1;
          return acc;
        }, {}),
        lastCollected: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get metrics summary:', error);
      return { error: error.message };
    }
  }

  /**
   * 停止指标收集
   */
  onModuleDestroy() {
    if (this.collectInterval) {
      clearInterval(this.collectInterval);
      this.logger.log('Metrics collection stopped');
    }
  }
} 
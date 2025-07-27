import { Controller, Get, Post, Delete, Param, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthCheckService, HealthStatus } from '../services/health-check.service';
import { MetricsService } from '../services/metrics.service';
import { ErrorRateMiddleware } from '../middleware/metrics.middleware';
import { ResponseDto } from '../../../common/dto/response.dto';
import { RequirePermissions } from '../../auth/decorators/auth.decorators';
import { Public } from '../../auth/decorators/auth.decorators';
import { ApiVersion } from '../../../common/decorators/api-version.decorator';

@ApiTags('监控系统')
@ApiVersion('1')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly metricsService: MetricsService,
    private readonly errorRateMiddleware: ErrorRateMiddleware,
  ) {}

  @Get('health')
  @Public()
  @ApiOperation({
    summary: '获取系统健康状态',
    description: '执行全面的系统健康检查，包括数据库、Redis、队列、内存、磁盘等各项检查',
  })
  @ApiResponse({
    status: 200,
    description: '健康检查成功',
    content: {
      'application/json': {
        example: {
          code: 200,
          message: '健康检查完成',
          data: {
            status: 'healthy',
            timestamp: '2025-07-27T12:00:00.000Z',
            uptime: 3600000,
            version: '1.0.0',
            environment: 'development',
            checks: {
              database: { status: 'healthy', message: 'Database responsive in 15ms', duration: 15 },
              redis: { status: 'healthy', message: 'Redis responsive in 8ms', duration: 8 },
              queue: { status: 'healthy', message: 'All queues healthy in 5ms', duration: 5 },
              memory: { status: 'healthy', message: 'Memory usage: 45.2%', duration: 2 },
              disk: { status: 'healthy', message: 'Disk usage: 32.1%', duration: 1 }
            },
            summary: { total: 5, healthy: 5, degraded: 0, unhealthy: 0 }
          }
        }
      }
    }
  })
  async getHealthCheck(): Promise<ResponseDto> {
    try {
      const result = await this.healthCheckService.performHealthCheck();
      return ResponseDto.success(result, '健康检查完成');
    } catch (error) {
      return ResponseDto.customError(500, '健康检查失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('health/quick')
  @Public()
  @ApiOperation({
    summary: '快速健康检查',
    description: '获取简化的健康状态信息，适用于负载均衡器探针',
  })
  @ApiResponse({
    status: 200,
    description: '快速检查成功',
    content: {
      'application/json': {
        example: {
          code: 200,
          message: '系统健康',
          data: {
            status: 'healthy',
            message: '5/5 checks passing'
          }
        }
      }
    }
  })
  async getQuickHealthCheck(): Promise<ResponseDto> {
    try {
      const result = await this.healthCheckService.getQuickHealthCheck();
      const statusCode = result.status === HealthStatus.HEALTHY ? 200 : 
                        result.status === HealthStatus.DEGRADED ? 200 : 503;
      
      return ResponseDto.success(result, result.status === HealthStatus.HEALTHY ? '系统健康' : '系统状态异常');
    } catch (error) {
      return ResponseDto.customError(503, '健康检查失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('health/liveness')
  @Public()
  @ApiOperation({
    summary: 'Kubernetes存活探针',
    description: '用于Kubernetes存活探针的简单检查',
  })
  async getLivenessProbe(): Promise<ResponseDto> {
    try {
      const result = await this.healthCheckService.getLivenessProbe();
      return ResponseDto.success(result, result.alive ? '服务存活' : '服务不可用');
    } catch (error) {
      return ResponseDto.customError(503, '存活探针失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('health/readiness')
  @Public()
  @ApiOperation({
    summary: 'Kubernetes就绪探针',
    description: '用于Kubernetes就绪探针的检查',
  })
  async getReadinessProbe(): Promise<ResponseDto> {
    try {
      const result = await this.healthCheckService.getReadinessProbe();
      const statusCode = result.ready ? 200 : 503;
      return ResponseDto.success(result, result.ready ? '服务就绪' : '服务未就绪');
    } catch (error) {
      return ResponseDto.customError(503, '就绪探针失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('metrics')
  @Public()
  @ApiOperation({
    summary: '获取Prometheus指标',
    description: '以Prometheus格式输出所有应用指标',
  })
  @ApiResponse({
    status: 200,
    description: 'Prometheus指标数据',
    content: {
      'text/plain': {
        example: `# HELP nestjs_http_requests_total Total number of HTTP requests
# TYPE nestjs_http_requests_total counter
nestjs_http_requests_total{method="GET",route="/api/health",status_code="200"} 15

# HELP nestjs_http_request_duration_seconds HTTP request duration in seconds
# TYPE nestjs_http_request_duration_seconds histogram
nestjs_http_request_duration_seconds_bucket{method="GET",route="/api/health",status_code="200",le="0.005"} 10`
      }
    }
  })
  async getMetrics(@Res() res: Response) {
    try {
      const metrics = await this.metricsService.getMetrics();
      res.set('Content-Type', this.metricsService.getContentType());
      res.send(metrics);
    } catch (error) {
      res.status(500).send(`# Error getting metrics: ${error.message}`);
    }
  }

  @Get('metrics/summary')
  @RequirePermissions('monitoring:read')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取指标摘要',
    description: '获取指标收集的摘要信息和统计数据',
  })
  async getMetricsSummary(): Promise<ResponseDto> {
    try {
      const summary = await this.metricsService.getMetricsSummary();
      return ResponseDto.success(summary, '指标摘要获取成功');
    } catch (error) {
      return ResponseDto.customError(500, '获取指标摘要失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Post('metrics/reset')
  @RequirePermissions('monitoring:admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '重置所有指标',
    description: '清除所有收集的指标数据',
  })
  async resetMetrics(): Promise<ResponseDto> {
    try {
      this.metricsService.resetMetrics();
      return ResponseDto.success(null, '指标已重置');
    } catch (error) {
      return ResponseDto.customError(500, '重置指标失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('error-rates')
  @RequirePermissions('monitoring:read')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取错误率统计',
    description: '获取各路由的错误率统计信息',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '返回结果数量限制',
    example: 20,
  })
  async getErrorRates(@Query('limit') limit = 20): Promise<ResponseDto> {
    try {
      const stats = this.errorRateMiddleware.getErrorRateStats();
      const limitedStats = stats.slice(0, +limit);
      
      return ResponseDto.success(
        {
          stats: limitedStats,
          summary: {
            totalRoutes: stats.length,
            highErrorRateRoutes: stats.filter(s => s.errorRate > 0.05).length,
            criticalErrorRateRoutes: stats.filter(s => s.errorRate > 0.1).length,
          },
        },
        '错误率统计获取成功',
      );
    } catch (error) {
      return ResponseDto.customError(500, '获取错误率统计失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('system/info')
  @RequirePermissions('monitoring:read')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取系统信息',
    description: '获取详细的系统运行信息',
  })
  async getSystemInfo(): Promise<ResponseDto> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const systemInfo = {
        process: {
          pid: process.pid,
          ppid: process.ppid,
          platform: process.platform,
          arch: process.arch,
          version: process.version,
          uptime: process.uptime(),
          cwd: process.cwd(),
          argv: process.argv,
          execPath: process.execPath,
        },
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
          arrayBuffers: Math.round((memUsage as any).arrayBuffers / 1024 / 1024),
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          appVersion: process.env.APP_VERSION || '1.0.0',
          timestamp: new Date().toISOString(),
        },
      };

      return ResponseDto.success(systemInfo, '系统信息获取成功');
    } catch (error) {
      return ResponseDto.customError(500, '获取系统信息失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('alerts/test/:type')
  @RequirePermissions('monitoring:admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '测试告警',
    description: '触发测试告警以验证告警系统功能',
  })
  @ApiParam({
    name: 'type',
    description: '告警类型',
    enum: ['health', 'memory', 'cpu', 'disk', 'error'],
    example: 'health',
  })
  async testAlert(@Param('type') type: string): Promise<ResponseDto> {
    try {
      // 这里可以实现告警测试逻辑
      const alertTypes = ['health', 'memory', 'cpu', 'disk', 'error'];
      
      if (!alertTypes.includes(type)) {
        return ResponseDto.customError(400, '不支持的告警类型', undefined, undefined, {
          supportedTypes: alertTypes,
        });
      }

      // 模拟发送测试告警
      const testAlert = {
        type,
        level: 'warning',
        message: `这是一个${type}类型的测试告警`,
        timestamp: new Date().toISOString(),
        source: 'monitoring-test',
      };

      // 实际项目中这里会调用告警服务
      console.log('Test alert triggered:', testAlert);

      return ResponseDto.success(testAlert, `${type}告警测试已触发`);
    } catch (error) {
      return ResponseDto.customError(500, '告警测试失败', undefined, undefined, {
        error: error.message,
      });
    }
  }

  @Get('dashboard')
  @RequirePermissions('monitoring:read')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '获取监控仪表板数据',
    description: '获取用于监控仪表板的综合数据',
  })
  async getDashboardData(): Promise<ResponseDto> {
    try {
      // 并行获取各种监控数据
      const [healthResult, metricsSummary, errorRates] = await Promise.all([
        this.healthCheckService.getQuickHealthCheck(),
        this.metricsService.getMetricsSummary(),
        Promise.resolve(this.errorRateMiddleware.getErrorRateStats().slice(0, 10)),
      ]);

      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      const dashboardData = {
        overview: {
          status: healthResult.status,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          version: process.env.APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        },
        health: {
          status: healthResult.status,
          message: healthResult.message,
        },
        metrics: metricsSummary,
        performance: {
          memory: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024),
            total: Math.round(memUsage.heapTotal / 1024 / 1024),
            usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system,
          },
          eventLoop: {
            lag: 0, // 这里可以添加实际的事件循环延迟测量
          },
        },
        errors: {
          topRoutes: errorRates,
          summary: {
            totalRoutes: errorRates.length,
            highErrorRoutes: errorRates.filter(r => r.errorRate > 0.05).length,
          },
        },
      };

      return ResponseDto.success(dashboardData, '仪表板数据获取成功');
    } catch (error) {
      return ResponseDto.customError(500, '获取仪表板数据失败', undefined, undefined, {
        error: error.message,
      });
    }
  }
} 
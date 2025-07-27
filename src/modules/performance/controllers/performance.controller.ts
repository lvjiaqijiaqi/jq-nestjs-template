import { Controller, Get, Query, Param, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DatabasePerformanceService } from '../services/database-performance.service';
import {
  CacheService,
  CacheStrategy,
} from '../../cache/services/cache.service';
import {
  ResponseDto,
  PaginatedResponseDto,
} from '../../../common/dto/response.dto';
import { RequirePermissions } from '../../auth/decorators/auth.decorators';
import { ApiVersion } from '../../../common/decorators/api-version.decorator';
import { API_RESPONSE_EXAMPLES } from '../../../config/swagger.config';

@ApiTags('性能监控')
@ApiBearerAuth('JWT-auth')
@ApiVersion('1')
@Controller('performance')
export class PerformanceController {
  constructor(
    private readonly databasePerformanceService: DatabasePerformanceService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('overview')
  @RequirePermissions('performance:read')
  @ApiOperation({
    summary: '获取性能概览',
    description: '获取数据库和缓存的整体性能指标概览',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    content: {
      'application/json': {
        example: {
          code: 200,
          message: '获取成功',
          data: {
            database: {
              status: 'healthy',
              connectionPool: { active: 2, idle: 3, total: 10 },
              queryStats: {
                totalQueries: 1000,
                slowQueries: 5,
                averageQueryTime: 45,
              },
            },
            cache: {
              status: 'healthy',
              hitRate: 85.5,
              totalOperations: 5000,
              averageLatency: 2.5,
            },
            recommendations: ['优化慢查询', '增加缓存使用'],
          },
        },
      },
    },
  })
  async getPerformanceOverview(): Promise<ResponseDto> {
    try {
      const [databaseHealth, cacheStats] = await Promise.all([
        this.databasePerformanceService.getHealthStatus(),
        this.cacheService.getStats(),
      ]);

      // 简单的缓存健康检查
      const cacheHealthy = await this.checkCacheHealth();

      const overview = {
        database: {
          status: databaseHealth.status,
          connectionPool: databaseHealth.metrics.connectionPool,
          queryStats: databaseHealth.metrics.queryStats,
          uptime: databaseHealth.uptime,
        },
        cache: {
          status: cacheHealthy ? 'healthy' : 'unhealthy',
          hitRate: cacheStats.hitRate,
          totalOperations: cacheStats.totalOperations,
          averageLatency: cacheStats.averageResponseTime,
        },
        recommendations: [
          ...databaseHealth.recommendations,
          ...(cacheStats.hitRate < 70 ? ['考虑优化缓存策略'] : []),
        ],
        lastUpdated: new Date().toISOString(),
      };

      return ResponseDto.success(overview, '获取性能概览成功');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '获取性能概览失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Get('database')
  @RequirePermissions('performance:read')
  @ApiOperation({
    summary: '获取数据库性能指标',
    description: '获取详细的数据库性能指标，包括连接池、查询统计、内存使用等',
  })
  async getDatabaseMetrics(): Promise<ResponseDto> {
    try {
      const metrics =
        await this.databasePerformanceService.getPerformanceMetrics();
      return ResponseDto.success(metrics, '获取数据库性能指标成功');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '获取数据库性能指标失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Get('database/health')
  @RequirePermissions('performance:read')
  @ApiOperation({
    summary: '获取数据库健康状态',
    description: '获取数据库健康状态和优化建议',
  })
  async getDatabaseHealth(): Promise<ResponseDto> {
    try {
      const health = await this.databasePerformanceService.getHealthStatus();
      return ResponseDto.success(health, '获取数据库健康状态成功');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '获取数据库健康状态失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Get('database/slow-queries')
  @RequirePermissions('performance:read')
  @ApiOperation({
    summary: '获取慢查询列表',
    description: '获取系统中执行时间较长的SQL查询列表',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '返回数量限制',
    example: 50,
  })
  async getSlowQueries(@Query('limit') limit = 50): Promise<ResponseDto> {
    try {
      const slowQueries = this.databasePerformanceService.getSlowQueries(limit);
      return ResponseDto.success(slowQueries, '获取慢查询列表成功');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '获取慢查询列表失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Delete('database/slow-queries')
  @RequirePermissions('performance:write')
  @ApiOperation({
    summary: '清除慢查询记录',
    description: '清除系统中记录的慢查询历史数据',
  })
  async clearSlowQueries(): Promise<ResponseDto> {
    try {
      this.databasePerformanceService.clearSlowQueries();
      return ResponseDto.success(null, '慢查询记录已清除');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '清除慢查询记录失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Get('cache')
  @RequirePermissions('performance:read')
  @ApiOperation({
    summary: '获取缓存性能指标',
    description: '获取缓存系统的性能指标和统计信息',
  })
  async getCacheMetrics(): Promise<ResponseDto> {
    try {
      const stats = this.cacheService.getStats();
      const isHealthy = await this.checkCacheHealth();

      const cacheMetrics = {
        health: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          isConnected: isHealthy,
        },
        stats,
      };

      return ResponseDto.success(cacheMetrics, '获取缓存性能指标成功');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '获取缓存性能指标失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Delete('cache/clear')
  @RequirePermissions('performance:write')
  @ApiOperation({
    summary: '清除所有缓存',
    description: '清除系统中的所有缓存数据',
  })
  async clearAllCache(): Promise<ResponseDto> {
    try {
      await this.cacheService.clear();
      return ResponseDto.success(null, '所有缓存已清除');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '清除缓存失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Delete('cache/strategy/:strategy/clear')
  @RequirePermissions('performance:write')
  @ApiOperation({
    summary: '清除指定策略的缓存',
    description: '清除指定缓存策略下的所有缓存数据',
  })
  @ApiParam({
    name: 'strategy',
    description: '缓存策略',
    enum: CacheStrategy,
    example: 'user',
  })
  async clearCacheByStrategy(
    @Param('strategy') strategy: CacheStrategy,
  ): Promise<ResponseDto> {
    try {
      await this.cacheService.clearByStrategy(strategy);
      return ResponseDto.success(null, `${strategy} 策略缓存已清除`);
    } catch (error) {
      return ResponseDto.customError(
        500,
        '清除策略缓存失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  @Get('system')
  @RequirePermissions('performance:read')
  @ApiOperation({
    summary: '获取系统性能指标',
    description: '获取系统层面的性能指标，包括内存、CPU等',
  })
  async getSystemMetrics(): Promise<ResponseDto> {
    try {
      const systemMetrics = {
        memory: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
        cpu: {
          usage: process.cpuUsage(),
        },
        uptime: Math.floor(process.uptime()),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        eventLoop: {
          delay: 0, // 需要使用perf_hooks获取
        },
      };

      return ResponseDto.success(systemMetrics, '获取系统性能指标成功');
    } catch (error) {
      return ResponseDto.customError(
        500,
        '获取系统性能指标失败',
        undefined,
        undefined,
        {
          error: error.message,
        },
      );
    }
  }

  /**
   * 简单的缓存健康检查
   */
  private async checkCacheHealth(): Promise<boolean> {
    try {
      const testKey = 'health-check-test';
      const testValue = { test: true, timestamp: Date.now() };

      await this.cacheService.set(testKey, testValue, { ttl: 10 });
      const result = await this.cacheService.get(testKey);
      await this.cacheService.del(testKey);

      return result !== null;
    } catch (error) {
      return false;
    }
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { ResponseDto } from './common/dto/response.dto';
import { Public } from './modules/auth/decorators/auth.decorators';
import { ApiVersion } from './common/decorators/api-version.decorator';
import { API_RESPONSE_EXAMPLES } from './config/swagger.config';

@ApiTags('应用')
@ApiVersion('1')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: '获取应用信息',
    description: '获取应用的基本信息，包括名称、版本、环境等',
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
            name: 'jq-project-template',
            version: '1.0.0',
            environment: 'development',
            description: '企业级 NestJS 样板项目',
            author: 'Your Team',
            license: 'MIT',
          },
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/info',
          requestId: 'req_12345',
        },
      },
    },
  })
  getAppInfo(): ResponseDto<any> {
    const appInfo = {
      name: this.configService.get<string>('app.name', 'jq-project-template'),
      version: this.configService.get<string>('app.version', '1.0.0'),
      environment: this.configService.get<string>('app.nodeEnv', 'development'),
      description: '企业级 NestJS 样板项目',
      author: 'Your Team',
      license: 'MIT',
      apiVersion: '1.0',
      buildTime: new Date().toISOString(),
      features: [
        'JWT 认证',
        '角色权限控制',
        'API 版本管理',
        '统一响应格式',
        '错误码管理',
        '安全中间件',
        'Swagger 文档',
        '数据验证',
        '分页查询',
        '日志系统',
      ],
    };

    return ResponseDto.success(appInfo, '获取应用信息成功');
  }

  @Public()
  @Get('health')
  @ApiOperation({
    summary: '健康检查',
    description: '检查应用和数据库的健康状态',
  })
  @ApiResponse({
    status: 200,
    description: '系统正常',
    content: {
      'application/json': {
        example: {
          code: 200,
          message: '系统运行正常',
          data: {
            status: 'ok',
            timestamp: '2025-07-27T08:00:00.000Z',
            uptime: 3600,
            environment: 'development',
            version: '1.0.0',
            database: {
              status: 'connected',
              type: 'mysql',
            },
            memory: {
              used: 128,
              total: 256,
            },
          },
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/health',
          requestId: 'req_12345',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '系统异常',
    content: {
      'application/json': {
        example: {
          code: 900004,
          message: '系统内部错误',
          data: {
            status: 'error',
            database: {
              status: 'disconnected',
              error: 'Connection timeout',
            },
          },
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/health',
          requestId: 'req_12345',
        },
      },
    },
  })
  async healthCheck(): Promise<ResponseDto<any>> {
    try {
      await this.dataSource.query('SELECT 1'); // Check DB connection

      const healthInfo = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: this.configService.get<string>('app.nodeEnv'),
        version: this.configService.get<string>('app.version'),
        database: {
          status: 'connected',
          type: 'mysql',
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        security: {
          cors: this.configService.get<boolean>('app.cors.enabled', true),
          rateLimit: true,
          helmet: true,
          validation: true,
        },
      };

      return ResponseDto.success(healthInfo, '系统运行正常');
    } catch (error) {
      const errorInfo = {
        status: 'error',
        timestamp: new Date().toISOString(),
        environment: this.configService.get<string>('app.nodeEnv'),
        version: this.configService.get<string>('app.version'),
        database: {
          status: 'disconnected',
          type: 'mysql',
          error: error.message,
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      };

      return ResponseDto.customError(
        500,
        '系统异常',
        undefined,
        undefined,
        errorInfo,
      );
    }
  }
}

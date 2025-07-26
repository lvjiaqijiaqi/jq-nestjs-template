import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ResponseDto } from './common/dto/response.dto';
import { Public } from './modules/auth/decorators/auth.decorators';

@ApiTags('应用')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取应用信息' })
  getHello(): ResponseDto<string> {
    const data = this.appService.getHello();
    return ResponseDto.success(data, '欢迎使用应用');
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  async healthCheck(): Promise<ResponseDto<any>> {
    try {
      // 检查数据库连接
      await this.dataSource.query('SELECT 1');
      
      const healthInfo = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.configService.get<string>('app.nodeEnv'),
        version: this.configService.get<string>('app.version'),
        database: {
          status: 'connected',
          type: 'postgres',
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
      };

      return ResponseDto.success(healthInfo, '系统运行正常');
    } catch (error) {
      const healthInfo = {
        status: 'error',
        timestamp: new Date().toISOString(),
        environment: this.configService.get<string>('app.nodeEnv'),
        version: this.configService.get<string>('app.version'),
        database: {
          status: 'disconnected',
          error: error.message,
        },
      };

      return ResponseDto.error(500, '系统检查失败');
    }
  }

  @Public()
  @Get('info')
  @ApiOperation({ summary: '获取应用详细信息' })
  getAppInfo(): ResponseDto<any> {
    const appInfo = {
      name: this.configService.get<string>('app.name'),
      version: this.configService.get<string>('app.version'),
      environment: this.configService.get<string>('app.nodeEnv'),
      port: this.configService.get<number>('app.port'),
      documentation: '/api/docs',
      repository: 'https://github.com/your-username/jq-project-template',
    };

    return ResponseDto.success(appInfo, '应用信息获取成功');
  }
}

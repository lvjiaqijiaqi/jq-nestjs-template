import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalConfigModule } from './shared/config.module';
import { DatabaseModule } from './shared/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SecurityModule } from './modules/security/security.module';
import { ApiDocsModule } from './modules/api-docs/api-docs.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { QueueModule } from './modules/queue/queue.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    GlobalConfigModule,
    DatabaseModule,
    SecurityModule,      // 安全模块
    ApiDocsModule,       // API文档模块
    PerformanceModule,   // 性能优化模块
    QueueModule,         // 队列系统模块
    MonitoringModule,    // 监控与健康检查模块
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

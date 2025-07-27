import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckService } from './services/health-check.service';
import { MetricsService } from './services/metrics.service';
import { MonitoringController } from './controllers/monitoring.controller';
import {
  MetricsMiddleware,
  ActiveConnectionsMiddleware,
  ErrorRateMiddleware,
} from './middleware/metrics.middleware';
import { QueueModule } from '../queue/queue.module';
import { CacheModule } from '../cache/cache.module';

@Global()
@Module({
  imports: [ConfigModule, TerminusModule, QueueModule, CacheModule],
  controllers: [MonitoringController],
  providers: [
    HealthCheckService,
    MetricsService,
    MetricsMiddleware,
    ActiveConnectionsMiddleware,
    ErrorRateMiddleware,
  ],
  exports: [
    HealthCheckService,
    MetricsService,
    MetricsMiddleware,
    ActiveConnectionsMiddleware,
    ErrorRateMiddleware,
  ],
})
export class MonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用指标收集中间件到所有路由
    consumer
      .apply(
        MetricsMiddleware,
        ActiveConnectionsMiddleware,
        ErrorRateMiddleware,
      )
      .forRoutes('*');
  }
}

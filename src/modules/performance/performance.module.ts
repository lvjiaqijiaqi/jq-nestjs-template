import { Module, Global } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { DatabasePerformanceService } from './services/database-performance.service';
import { PerformanceController } from './controllers/performance.controller';

@Global()
@Module({
  imports: [CacheModule],
  providers: [DatabasePerformanceService],
  controllers: [PerformanceController],
  exports: [DatabasePerformanceService, CacheModule],
})
export class PerformanceModule {} 
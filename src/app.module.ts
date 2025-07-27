import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalConfigModule } from './shared/config.module';
import { DatabaseModule } from './shared/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SecurityModule } from './modules/security/security.module';
import { ApiDocsModule } from './modules/api-docs/api-docs.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    GlobalConfigModule,
    DatabaseModule,
    SecurityModule, // 安全模块
    ApiDocsModule,  // API文档模块
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局启用JWT认证守卫（可以通过@Public()装饰器跳过）
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

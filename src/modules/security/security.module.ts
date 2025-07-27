import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 中间件
import { SecurityMiddleware } from '../../common/middleware/security.middleware';

// 拦截器
// import { XssFilterInterceptor } from '../../common/interceptors/xss-filter.interceptor';

// 验证器
import { IsStrongPasswordConstraint } from '../../common/validators/password.validator';

@Module({
  imports: [
    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('security.throttle.ttl', 60) * 1000, // 转换为毫秒
            limit: configService.get('security.throttle.limit', 100),
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // 全局XSS过滤拦截器 (暂时禁用)
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: XssFilterInterceptor,
    // },
    // 自定义验证器
    IsStrongPasswordConstraint,
    // 中间件
    SecurityMiddleware,
  ],
  exports: [
    SecurityMiddleware,
    IsStrongPasswordConstraint,
  ],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 应用安全中间件到所有路由
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*');
  }
} 
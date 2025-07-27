import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// 拦截器
import { ResponseTransformInterceptor } from '../../common/interceptors/response-transform.interceptor';
import { ApiVersionInterceptor } from '../../common/interceptors/api-version.interceptor';

// 过滤器
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';

@Module({
  providers: [
    // 全局响应转换拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    // 全局API版本拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiVersionInterceptor,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class ApiDocsModule {}

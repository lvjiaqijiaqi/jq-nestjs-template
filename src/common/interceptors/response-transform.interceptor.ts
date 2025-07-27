import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ResponseDto } from '../dto/response.dto';
import { generateRequestId } from '../../utils/request-id.util';

/**
 * 跳过响应转换的装饰器键
 */
export const SKIP_RESPONSE_TRANSFORM = 'skipResponseTransform';

/**
 * 响应转换拦截器
 * 自动将控制器的返回值包装成统一的响应格式
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  private readonly logger = new Logger(ResponseTransformInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    // 检查是否跳过响应转换
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_TRANSFORM,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const requestId = generateRequestId(request);
    const path = request.url;

    return next.handle().pipe(
      map((data) => {
        // 如果返回的数据已经是 ResponseDto 格式，直接返回
        if (data && data.code !== undefined && data.message !== undefined) {
          // 补充缺失的字段
          if (!data.timestamp) {
            data.timestamp = new Date().toISOString();
          }
          if (!data.path) {
            data.path = path;
          }
          if (!data.requestId) {
            data.requestId = requestId;
          }
          return data;
        }

        // 否则包装成标准响应格式
        return ResponseDto.success(data, '操作成功', path, requestId);
      }),
    );
  }
}

/**
 * 跳过响应转换装饰器
 * 在控制器方法或类上使用此装饰器可跳过自动响应转换
 */
export function SkipResponseTransform() {
  const Reflect = require('reflect-metadata');
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      // 方法级别
      Reflect.defineMetadata(SKIP_RESPONSE_TRANSFORM, true, descriptor.value);
    } else {
      // 类级别
      Reflect.defineMetadata(SKIP_RESPONSE_TRANSFORM, true, target);
    }
  };
}

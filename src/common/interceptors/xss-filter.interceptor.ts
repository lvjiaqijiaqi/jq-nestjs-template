import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 导入xss包的正确方式
const xss = require('xss');

@Injectable()
export class XssFilterInterceptor implements NestInterceptor {
  private readonly xssOptions = {
    whiteList: {
      // 允许的标签和属性
      a: ['href', 'title'],
      b: [],
      br: [],
      div: [],
      em: [],
      i: [],
      img: ['src', 'alt', 'title', 'width', 'height'],
      p: [],
      span: [],
      strong: [],
      // 可以根据需要添加更多标签
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    try {
      // 过滤请求体中的XSS
      if (request.body && typeof request.body === 'object') {
        request.body = this.sanitizeObject(request.body);
      }

      // 对于query和params，我们创建新对象而不是直接修改
      if (request.query && typeof request.query === 'object') {
        const sanitizedQuery = this.sanitizeObject({ ...request.query });
        // 使用Object.defineProperty来替换query对象
        Object.defineProperty(request, 'query', {
          value: sanitizedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }

      if (request.params && typeof request.params === 'object') {
        const sanitizedParams = this.sanitizeObject({ ...request.params });
        // 使用Object.defineProperty来替换params对象
        Object.defineProperty(request, 'params', {
          value: sanitizedParams,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    } catch (error) {
      // 如果XSS过滤失败，记录错误但不阻断请求
      console.warn('XSS filtering failed:', error.message);
    }

    return next.handle().pipe(
      map((data) => {
        // 可选：也可以过滤响应数据中的XSS
        return data;
      }),
    );
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss(obj, this.xssOptions);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }
}

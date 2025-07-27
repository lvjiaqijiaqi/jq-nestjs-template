import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../dto/response.dto';
import { ERROR_CODES, getErrorByHttpStatus } from '../constants/error-codes';
import { getRequestId } from '../../utils/request-id.util';

/**
 * 全局HTTP异常过滤器
 * 统一处理所有HTTP异常，返回标准化的错误响应
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = getRequestId(request);
    const path = request.url;
    const method = request.method;
    const userAgent = request.get('User-Agent') || 'unknown';

    let status: number;
    let errorResponse: ResponseDto;

    if (exception instanceof HttpException) {
      // 处理HTTP异常
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;

        // 处理验证错误
        if (responseObj.message && Array.isArray(responseObj.message)) {
          errorResponse = ResponseDto.error(
            ERROR_CODES.INVALID_PARAMS,
            path,
            requestId,
            {
              validationErrors: responseObj.message,
              statusCode: status,
            },
          );
        } else {
          // 其他结构化错误
          const errorCode = getErrorByHttpStatus(status);
          errorResponse = ResponseDto.customError(
            status,
            responseObj.message || errorCode.message,
            path,
            requestId,
            responseObj.error ? { error: responseObj.error } : undefined,
          );
        }
      } else {
        // 简单字符串错误
        const errorCode = getErrorByHttpStatus(status);
        errorResponse = ResponseDto.customError(
          status,
          exceptionResponse || errorCode.message,
          path,
          requestId,
        );
      }
    } else {
      // 处理未知异常
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      const errorCode = ERROR_CODES.SYSTEM_INTERNAL_ERROR;

      errorResponse = ResponseDto.error(
        errorCode,
        path,
        requestId,
        process.env.NODE_ENV === 'development'
          ? {
              error:
                exception instanceof Error
                  ? exception.message
                  : 'Unknown error',
              stack: exception instanceof Error ? exception.stack : undefined,
            }
          : undefined,
      );

      // 记录未知异常的详细信息
      this.logger.error(
        `Unhandled exception: ${method} ${path}`,
        exception instanceof Error ? exception.stack : exception,
        HttpExceptionFilter.name,
      );
    }

    // 记录错误日志
    const logMessage = `${method} ${path} ${status} - ${errorResponse.message} - RequestId: ${requestId} - UserAgent: ${userAgent}`;

    if (status >= 500) {
      this.logger.error(logMessage);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    }

    // 设置响应头
    response.status(status);
    response.setHeader('X-Request-Id', requestId || '');

    // 发送错误响应
    response.json(errorResponse);
  }
}

/**
 * 业务异常类
 * 用于抛出业务逻辑相关的异常
 */
export class BusinessException extends HttpException {
  constructor(
    errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
    data?: any,
  ) {
    super(
      {
        code: errorCode.code,
        message: errorCode.message,
        data,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * 认证异常类
 */
export class AuthException extends HttpException {
  constructor(
    errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
    data?: any,
  ) {
    super(
      {
        code: errorCode.code,
        message: errorCode.message,
        data,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * 权限异常类
 */
export class ForbiddenException extends HttpException {
  constructor(
    errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
    data?: any,
  ) {
    super(
      {
        code: errorCode.code,
        message: errorCode.message,
        data,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * 资源不存在异常类
 */
export class NotFoundException extends HttpException {
  constructor(
    errorCode: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
    data?: any,
  ) {
    super(
      {
        code: errorCode.code,
        message: errorCode.message,
        data,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

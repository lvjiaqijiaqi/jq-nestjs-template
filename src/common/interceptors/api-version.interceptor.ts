import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { API_VERSION_METADATA, getApiVersionInfo, isApiVersionDeprecated } from '../decorators/api-version.decorator';
import { ERROR_CODES } from '../constants/error-codes';

/**
 * API版本拦截器
 * 处理API版本验证和废弃警告
 */
@Injectable()
export class ApiVersionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiVersionInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // 获取请求的API版本
    const requestedVersion = this.extractApiVersion(request);
    
    // 获取控制器和方法的版本信息
    const controllerVersions = this.getControllerVersions(context);
    const methodVersions = this.getMethodVersions(context);
    
    // 方法级别的版本优先于控制器级别
    const supportedVersions = methodVersions.length > 0 ? methodVersions : controllerVersions;

    // 如果没有指定版本，使用默认版本
    if (supportedVersions.length === 0) {
      return next.handle();
    }

    // 验证版本
    if (requestedVersion && !this.isVersionSupported(requestedVersion, supportedVersions)) {
      throw new BadRequestException({
        ...ERROR_CODES.INVALID_REQUEST,
        message: `不支持的API版本: ${requestedVersion}`,
        supportedVersions: supportedVersions.map(v => v.version || v),
      });
    }

    // 检查版本废弃状态
    const currentVersion = requestedVersion || this.getLatestVersion(supportedVersions);
    const deprecationInfo = this.getDeprecationInfo(currentVersion, supportedVersions);

    if (deprecationInfo) {
      // 添加废弃警告头
      response.setHeader('X-API-Deprecated', 'true');
      response.setHeader('X-API-Deprecated-Version', deprecationInfo.version);
      
      if (deprecationInfo.deprecatedSince) {
        response.setHeader('X-API-Deprecated-Since', deprecationInfo.deprecatedSince);
      }
      
      if (deprecationInfo.removalDate) {
        response.setHeader('X-API-Removal-Date', deprecationInfo.removalDate);
      }

      // 记录废弃API使用日志
      this.logger.warn(
        `Deprecated API used: ${request.method} ${request.url} (version: ${currentVersion})`,
      );
    }

    // 添加当前API版本到响应头
    response.setHeader('X-API-Version', currentVersion);

    return next.handle().pipe(
      tap(() => {
        // 在响应完成后的处理
      }),
    );
  }

  /**
   * 从请求中提取API版本
   */
  private extractApiVersion(request: Request): string | undefined {
    // 从URL路径中提取版本 (例如: /api/v1/users)
    const pathMatch = request.url.match(/\/api\/v(\d+(?:\.\d+)?)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    // 从查询参数中提取版本
    const queryVersion = request.query.version as string;
    if (queryVersion) {
      return queryVersion;
    }

    // 从请求头中提取版本
    const headerVersion = request.headers['api-version'] as string;
    if (headerVersion) {
      return headerVersion;
    }

    // 从Accept头中提取版本 (例如: Accept: application/vnd.api+json;version=1)
    const acceptHeader = request.headers.accept;
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/version=(\d+(?:\.\d+)?)/);
      if (versionMatch) {
        return versionMatch[1];
      }
    }

    return undefined;
  }

  /**
   * 获取控制器支持的版本
   */
  private getControllerVersions(context: ExecutionContext): any[] {
    return this.reflector.get<any[]>(API_VERSION_METADATA, context.getClass()) || [];
  }

  /**
   * 获取方法支持的版本
   */
  private getMethodVersions(context: ExecutionContext): any[] {
    return this.reflector.get<any[]>(API_VERSION_METADATA, context.getHandler()) || [];
  }

  /**
   * 检查版本是否被支持
   */
  private isVersionSupported(version: string, supportedVersions: any[]): boolean {
    return supportedVersions.some(v => {
      const versionStr = typeof v === 'string' ? v : v.version;
      return versionStr === version;
    });
  }

  /**
   * 获取最新版本
   */
  private getLatestVersion(supportedVersions: any[]): string {
    if (supportedVersions.length === 0) {
      return '1';
    }

    // 简单实现：返回第一个版本
    const firstVersion = supportedVersions[0];
    return typeof firstVersion === 'string' ? firstVersion : firstVersion.version;
  }

  /**
   * 获取废弃信息
   */
  private getDeprecationInfo(version: string, supportedVersions: any[]): any {
    const versionInfo = supportedVersions.find(v => {
      const versionStr = typeof v === 'string' ? v : v.version;
      return versionStr === version;
    });

    if (versionInfo && typeof versionInfo === 'object' && versionInfo.deprecated) {
      return versionInfo;
    }

    return null;
  }
} 
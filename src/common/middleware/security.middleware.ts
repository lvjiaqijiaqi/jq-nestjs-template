import { Injectable, NestMiddleware, Logger, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // 获取客户端IP
    const clientIp = this.getClientIp(req);
    
    // IP白名单/黑名单检查
    this.checkIpFilter(clientIp);

    // 请求日志
    this.logRequest(req, clientIp);

    // 响应完成时记录日志
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.logResponse(req, res, clientIp, duration);
    });

    // 添加安全头
    this.setSecurityHeaders(res);

    next();
  }

  private getClientIp(req: Request): string {
    return (
      req.headers['cf-connecting-ip'] as string ||
      req.headers['x-forwarded-for'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  private checkIpFilter(clientIp: string): void {
    const ipConfig = this.configService.get('security.ipFilter');
    
    if (ipConfig.blacklist && ipConfig.blacklist.length > 0) {
      if (ipConfig.blacklist.includes(clientIp)) {
        this.logger.warn(`🚫 Blocked IP address: ${clientIp}`);
        throw new ForbiddenException('Access denied');
      }
    }

    if (ipConfig.whitelist && ipConfig.whitelist.length > 0) {
      if (!ipConfig.whitelist.includes(clientIp)) {
        this.logger.warn(`🚫 IP not in whitelist: ${clientIp}`);
        throw new ForbiddenException('Access denied');
      }
    }
  }

  private logRequest(req: Request, clientIp: string): void {
    const { method, originalUrl, headers } = req;
    const userAgent = headers['user-agent'] || 'unknown';
    
    this.logger.log(`🔗 ${method} ${originalUrl} - IP: ${clientIp} - Agent: ${userAgent}`);
  }

  private logResponse(req: Request, res: Response, clientIp: string, duration: number): void {
    const { method, originalUrl } = req;
    const { statusCode } = res;
    
    const logLevel = statusCode >= 400 ? 'warn' : 'log';
    const emoji = statusCode >= 500 ? '💥' : statusCode >= 400 ? '⚠️' : '✅';
    
    this.logger[logLevel](`${emoji} ${method} ${originalUrl} ${statusCode} - ${duration}ms - IP: ${clientIp}`);
  }

  private setSecurityHeaders(res: Response): void {
    // 防止点击劫持
    res.setHeader('X-Frame-Options', 'DENY');
    
    // 防止MIME类型嗅探
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // XSS保护
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // 引用策略
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // 权限策略
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
} 
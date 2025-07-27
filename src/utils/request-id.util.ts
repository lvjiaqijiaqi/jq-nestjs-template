import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * 生成请求ID
 * 优先使用请求头中的ID，否则生成新的UUID
 */
export function generateRequestId(request: Request): string {
  // 检查请求头中是否已有请求ID
  const existingId = request.headers['x-request-id'] || 
                    request.headers['x-correlation-id'] || 
                    request.headers['request-id'];

  if (existingId && typeof existingId === 'string') {
    return existingId;
  }

  // 生成新的请求ID
  const requestId = `req_${uuidv4().replace(/-/g, '')}`;
  
  // 将请求ID存储到请求对象中，供后续使用
  (request as any).requestId = requestId;
  
  return requestId;
}

/**
 * 从请求对象中获取请求ID
 */
export function getRequestId(request: Request): string | undefined {
  return (request as any).requestId || 
         request.headers['x-request-id'] as string || 
         request.headers['x-correlation-id'] as string || 
         request.headers['request-id'] as string;
}

/**
 * 生成短ID（用于日志等场景）
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * 生成带前缀的ID
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${uuidv4().replace(/-/g, '')}`;
} 
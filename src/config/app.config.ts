import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  name: process.env.APP_NAME || 'jq-project-template',
  version: process.env.APP_VERSION || '1.0.0',
  
  // API 配置
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // 安全配置
  cors: {
    enabled: process.env.CORS_ENABLED === 'true' || true,
    credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  },
  
  // 限流配置
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  
  // 文件上传配置
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
      'jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'
    ],
  },
})); 
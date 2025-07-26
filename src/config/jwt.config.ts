import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  // JWT 选项配置
  options: {
    issuer: process.env.JWT_ISSUER || 'jq-project-template',
    audience: process.env.JWT_AUDIENCE || 'jq-project-template-users',
  },
})); 
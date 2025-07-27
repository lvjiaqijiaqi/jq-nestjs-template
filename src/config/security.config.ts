import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // 限流配置
  throttle: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // 时间窗口（秒）
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10), // 请求次数限制
    skipIfBehindProxy: false,
  },

  // 请求体大小限制
  bodyParser: {
    limit: process.env.BODY_PARSER_LIMIT || '10mb',
    parameterLimit: parseInt(
      process.env.BODY_PARSER_PARAMETER_LIMIT || '1000',
      10,
    ),
  },

  // Helmet 安全头配置
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        scriptSrc: [`'self'`],
        objectSrc: [`'none'`],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  },

  // IP 白名单/黑名单
  ipFilter: {
    whitelist: process.env.IP_WHITELIST
      ? process.env.IP_WHITELIST.split(',')
      : [],
    blacklist: process.env.IP_BLACKLIST
      ? process.env.IP_BLACKLIST.split(',')
      : [],
    trustProxy: true,
  },

  // 密码策略
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true' || true,
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true' || true,
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true' || true,
    requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true' || false,
  },

  // 会话安全
  session: {
    maxConcurrentSessions: parseInt(
      process.env.MAX_CONCURRENT_SESSIONS || '5',
      10,
    ),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600', 10), // 秒
  },
}));

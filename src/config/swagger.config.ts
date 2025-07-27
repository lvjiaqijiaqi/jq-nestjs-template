import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

/**
 * Swagger文档配置
 */
export function createSwaggerConfig() {
  return (
    new DocumentBuilder()
      .setTitle('NestJS 企业级样板 API')
      .setDescription(
        `
# 企业级 NestJS 样板项目 API 文档

这是一个功能完整的企业级 NestJS 样板项目，包含：

## 🛡️ 安全特性
- JWT 认证和刷新令牌
- 基于角色的权限控制 (RBAC)
- API 限流和安全头
- XSS 防护和输入验证

## 🗄️ 数据管理
- TypeORM 数据库集成
- 软删除和审计字段
- 分页查询支持
- 数据验证和转换

## 📋 API 特性
- 统一响应格式
- 错误码管理
- API 版本控制
- 完整的 Swagger 文档

## 🚀 使用说明

### 认证流程
1. 使用 \`POST /auth/login\` 登录获取访问令牌
2. 在请求头中添加 \`Authorization: Bearer <token>\`
3. 使用 \`POST /auth/refresh\` 刷新过期令牌

### 权限控制
- 不同接口需要不同权限
- 管理员拥有所有权限
- 普通用户只能访问部分接口

### 错误处理
所有错误都会返回统一格式：
\`\`\`json
{
  "code": 400001,
  "message": "权限不足",
  "timestamp": "2025-07-27T08:00:00.000Z",
  "path": "/api/users",
  "requestId": "req_12345"
}
\`\`\`
    `,
      )
      .setVersion('1.0.0')
      .setContact(
        'API Support',
        'https://github.com/your-org/nestjs-template',
        'support@yourorg.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer('http://localhost:3000', '开发环境')
      .addServer('https://api-staging.yourorg.com', '测试环境')
      .addServer('https://api.yourorg.com', '生产环境')

      // JWT认证配置
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: '请输入JWT访问令牌',
          in: 'header',
        },
        'JWT-auth',
      )

      // API Key认证配置（如果需要）
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API密钥认证',
        },
        'X-API-Key',
      )

      // 基础认证配置（如果需要）
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
          description: '基础认证 (用户名:密码)',
        },
        'basic-auth',
      )

      // API标签分组
      .addTag('应用', '应用基础信息和健康检查')
      .addTag('认证', '用户认证和授权相关接口')
      .addTag('用户', '用户管理相关接口')
      .addTag('角色权限', '角色和权限管理接口')
      .addTag('文件', '文件上传和管理接口')
      .addTag('系统', '系统管理和配置接口')

      // 外部文档链接
      .setExternalDoc('项目仓库', 'https://github.com/your-org/nestjs-template')
      .build()
  );
}

/**
 * Swagger文档选项配置
 */
export const swaggerOptions: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,

  // 包含的模块
  include: [],

  // 额外的模型
  extraModels: [],

  // 深度限制
  deepScanRoutes: true,

  // 忽略全局前缀
  ignoreGlobalPrefix: false,
};

/**
 * Swagger UI 配置选项
 */
export const swaggerUiOptions = {
  swaggerOptions: {
    // 持久化认证信息
    persistAuthorization: true,

    // 显示扩展信息
    displayExtensions: true,

    // 显示操作ID
    displayOperationId: true,

    // 默认模型扩展深度
    defaultModelExpandDepth: 3,

    // 默认模型渲染
    defaultModelRendering: 'model' as const,

    // 显示请求持续时间
    displayRequestDuration: true,

    // 文档扩展
    docExpansion: 'list' as const,

    // 过滤器
    filter: true,

    // 最大显示的标签数量
    maxDisplayedTags: 50,

    // 显示通用扩展
    showExtensions: true,

    // 显示通用扩展
    showCommonExtensions: true,

    // 支持的提交方法
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],

    // 验证器URL
    validatorUrl: null,

    // 自定义CSS
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 5px; }
    `,

    // 自定义站点标题
    customSiteTitle: 'NestJS 企业级样板 API 文档',

    // 自定义favicon
    customfavIcon: '/favicon.ico',
  },
};

/**
 * API响应示例
 */
export const API_RESPONSE_EXAMPLES = {
  SUCCESS: {
    description: '操作成功',
    content: {
      'application/json': {
        example: {
          code: 200,
          message: '操作成功',
          data: {},
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/example',
          requestId: 'req_12345',
        },
      },
    },
  },

  UNAUTHORIZED: {
    description: '未授权',
    content: {
      'application/json': {
        example: {
          code: 200002,
          message: '认证令牌无效',
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/example',
          requestId: 'req_12345',
        },
      },
    },
  },

  FORBIDDEN: {
    description: '权限不足',
    content: {
      'application/json': {
        example: {
          code: 400001,
          message: '权限不足',
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/example',
          requestId: 'req_12345',
        },
      },
    },
  },

  NOT_FOUND: {
    description: '资源不存在',
    content: {
      'application/json': {
        example: {
          code: 100006,
          message: '资源不存在',
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/example',
          requestId: 'req_12345',
        },
      },
    },
  },

  VALIDATION_ERROR: {
    description: '参数验证错误',
    content: {
      'application/json': {
        example: {
          code: 100002,
          message: '参数错误',
          data: {
            validationErrors: [
              'username must be longer than or equal to 3 characters',
              'email must be an email',
            ],
          },
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/example',
          requestId: 'req_12345',
        },
      },
    },
  },

  RATE_LIMIT: {
    description: '请求频率超限',
    content: {
      'application/json': {
        example: {
          code: 100004,
          message: '请求频率超限',
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/example',
          requestId: 'req_12345',
        },
      },
    },
  },

  INTERNAL_ERROR: {
    description: '服务器内部错误',
    content: {
      'application/json': {
        example: {
          code: 900004,
          message: '系统内部错误',
          timestamp: '2025-07-27T08:00:00.000Z',
          path: '/api/example',
          requestId: 'req_12345',
        },
      },
    },
  },
};

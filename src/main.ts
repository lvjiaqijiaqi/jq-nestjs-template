import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  createSwaggerConfig,
  swaggerOptions,
  swaggerUiOptions,
} from './config/swagger.config';

// 正确导入helmet和compression
const helmet = require('helmet');
const compression = require('compression');

async function bootstrap() {
  // 创建应用时启用详细日志
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 安全中间件 - Helmet
  const helmetConfig = configService.get('security.helmet');
  app.use(helmet(helmetConfig));

  // 启用压缩
  app.use(compression());

  // 请求体大小限制
  const bodyParserConfig = configService.get('security.bodyParser');
  app.use('/api', (req, res, next) => {
    if (req.headers['content-length']) {
      const contentLength = parseInt(req.headers['content-length']);
      const maxSize =
        parseInt(bodyParserConfig.limit.replace('mb', '')) * 1024 * 1024;
      if (contentLength > maxSize) {
        return res.status(413).json({
          code: 413,
          message: '请求体过大',
          data: null,
        });
      }
    }
    next();
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // 添加验证错误详细信息
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // 获取配置
  const port = configService.get<number>('app.port', 3000);
  const appName = configService.get<string>('app.name', 'jq-project-template');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const apiPrefix = configService.get<string>('app.api.prefix', 'api');

  // 设置全局API前缀
  app.setGlobalPrefix(apiPrefix);

  // CORS 配置
  const corsEnabled = configService.get<boolean>('app.cors.enabled', true);
  if (corsEnabled) {
    app.enableCors({
      origin: nodeEnv === 'production' ? false : true, // 生产环境需要配置具体域名
      credentials: configService.get<boolean>('app.cors.credentials', true),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Version',
        'X-Request-Id',
      ],
    });
  }

  // Swagger 文档配置
  if (nodeEnv !== 'production') {
    const swaggerConfig = createSwaggerConfig();
    const document = SwaggerModule.createDocument(
      app,
      swaggerConfig,
      swaggerOptions,
    );

    // 设置Swagger文档路径
    const docsPath = `${apiPrefix}/docs`;
    SwaggerModule.setup(docsPath, app, document, swaggerUiOptions);

    logger.log(
      `📚 Swagger documentation: http://localhost:${port}/${docsPath}`,
    );
    logger.log(`📋 API 规范文档: http://localhost:${port}/${docsPath}-json`);
  }

  // 启动应用
  await app.listen(port);

  logger.log(`🚀 ${appName} is running on: http://localhost:${port}`);
  logger.log(`🌐 API 基础路径: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📄 Environment: ${nodeEnv}`);
  logger.log(
    `🛡️ Security features enabled: Helmet, CORS, Rate Limiting, Input Validation`,
  );
  logger.log(
    `📊 Logs enabled: HTTP requests, Database queries, Application events`,
  );
  logger.log(
    `🎯 Features: JWT Auth, RBAC, API Versioning, Unified Response, Error Codes`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

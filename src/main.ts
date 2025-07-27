import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

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
      const maxSize = parseInt(bodyParserConfig.limit.replace('mb', '')) * 1024 * 1024;
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

  // CORS 配置
  const corsEnabled = configService.get<boolean>('app.cors.enabled', true);
  if (corsEnabled) {
    app.enableCors({
      origin: nodeEnv === 'production' ? false : true, // 生产环境需要配置具体域名
      credentials: configService.get<boolean>('app.cors.credentials', true),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
  }

  // Swagger 文档配置
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NestJS API Documentation')
      .setDescription('企业级 NestJS 样板项目 API 文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .addTag('认证', '用户认证相关接口')
      .addTag('应用', '应用基础接口')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }

  // 启动应用
  await app.listen(port);

  logger.log(`🚀 ${appName} is running on: http://localhost:${port}`);
  logger.log(`📄 Environment: ${nodeEnv}`);
  logger.log(`🛡️ Security features enabled: Helmet, CORS, Rate Limiting, XSS Protection`);
  logger.log(`📊 Logs enabled: HTTP requests, Database queries, Application events`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

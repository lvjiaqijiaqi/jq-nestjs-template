import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
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
    });
  }

  // 启动应用
  await app.listen(port);

  logger.log(`🚀 ${appName} is running on: http://localhost:${port}`);
  logger.log(`📄 Environment: ${nodeEnv}`);
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './services/queue.service';
import { EmailProcessor } from './processors/email.processor';
import { FileProcessor } from './processors/file.processor';
import { QueueController } from './controllers/queue.controller';

@Global()
@Module({
  imports: [
    // 配置Bull队列
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const queueConfig = configService.get('queue');
        return {
          redis: queueConfig.redis,
          defaultJobOptions: queueConfig.global.defaultJobOptions,
          settings: queueConfig.global.settings,
        };
      },
      inject: [ConfigService],
    }),

    // 注册各个队列
    BullModule.registerQueueAsync(
      {
        name: 'email-queue',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const queueConfig = configService.get('queue');
          return {
            defaultJobOptions: queueConfig.queues.email.defaultJobOptions,
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'file-queue',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const queueConfig = configService.get('queue');
          return {
            defaultJobOptions: queueConfig.queues.file.defaultJobOptions,
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'notification-queue',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const queueConfig = configService.get('queue');
          return {
            defaultJobOptions: queueConfig.queues.notification.defaultJobOptions,
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'data-queue',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const queueConfig = configService.get('queue');
          return {
            defaultJobOptions: queueConfig.queues.data.defaultJobOptions,
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'report-queue',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const queueConfig = configService.get('queue');
          return {
            defaultJobOptions: queueConfig.queues.report.defaultJobOptions,
          };
        },
        inject: [ConfigService],
      },
    ),
  ],
  controllers: [QueueController],
  providers: [
    QueueService,
    EmailProcessor,
    FileProcessor,
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule {} 
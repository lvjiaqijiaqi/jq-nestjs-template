import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                'app.name': 'jq-project-template',
                'app.version': '1.0.0',
                'app.nodeEnv': 'test',
              };
              return config[key] || defaultValue;
            }),
          },
        },
        {
          provide: DataSource,
          useValue: {
            isInitialized: true,
            query: jest.fn().mockResolvedValue([{ result: 1 }]),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app info', () => {
      const result = appController.getAppInfo();
      expect(result).toBeDefined();
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('version');
      expect(result.data).toHaveProperty('environment');
    });
  });
});

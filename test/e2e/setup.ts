import '../setup';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

// 全局应用实例
let app: INestApplication;
let dataSource: DataSource;

// E2E测试前的全局设置
beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  // 应用全局管道和中间件
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  // 获取数据源
  dataSource = app.get<DataSource>(getDataSourceToken());
});

// E2E测试后的全局清理
afterAll(async () => {
  if (dataSource) {
    await dataSource.destroy();
  }
  if (app) {
    await app.close();
  }
});

// 每个测试前清理数据库
beforeEach(async () => {
  if (dataSource) {
    // 清理测试数据
    await cleanDatabase();
  }
});

/**
 * 清理测试数据库
 */
async function cleanDatabase() {
  try {
    // 获取所有表名
    const entities = dataSource.entityMetadatas;

    // 禁用外键约束检查
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // 清空所有表
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }

    // 启用外键约束检查
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
}

// 导出应用实例供测试使用
export { app, dataSource };

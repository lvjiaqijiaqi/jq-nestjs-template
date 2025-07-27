import '../setup';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

// 全局模块和服务实例
let moduleRef: TestingModule;
let dataSource: DataSource;
let cacheManager: Cache;

// 集成测试前的全局设置
beforeAll(async () => {
  // 这里根据测试需要可以创建特定的测试模块
  // 例如：仅包含需要测试的模块，而不是整个AppModule
});

// 集成测试后的全局清理
afterAll(async () => {
  if (dataSource) {
    await dataSource.destroy();
  }
  if (moduleRef) {
    await moduleRef.close();
  }
});

// 每个测试前的设置
beforeEach(async () => {
  if (dataSource) {
    await cleanDatabase();
  }
  if (cacheManager) {
    await (cacheManager as any).reset?.() || await (cacheManager as any).flushAll?.();
  }
});

/**
 * 创建测试模块
 * @param imports 要导入的模块
 * @param providers 要提供的服务
 */
export async function createTestingModule(imports: any[] = [], providers: any[] = []) {
  moduleRef = await Test.createTestingModule({
    imports,
    providers,
  }).compile();

  // 获取常用服务
  try {
    dataSource = moduleRef.get<DataSource>(getDataSourceToken());
  } catch (error) {
    // 数据源不存在时忽略
  }

  try {
    cacheManager = moduleRef.get<Cache>(CACHE_MANAGER);
  } catch (error) {
    // 缓存不存在时忽略
  }

  return moduleRef;
}

/**
 * 清理测试数据库
 */
async function cleanDatabase() {
  if (!dataSource) return;

  try {
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

/**
 * 获取测试模块实例
 */
export function getTestingModule() {
  return moduleRef;
}

/**
 * 获取数据源实例
 */
export function getTestDataSource() {
  return dataSource;
}

/**
 * 获取缓存管理器实例
 */
export function getTestCacheManager() {
  return cacheManager;
} 
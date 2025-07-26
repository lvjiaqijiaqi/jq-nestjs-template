import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthSeederService } from '../modules/auth/services/seeder.service';

async function runSeed() {
  console.log('🌱 开始运行认证种子数据...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const authSeeder = app.get(AuthSeederService);
    await authSeeder.seed();
    console.log('✅ 认证种子数据运行完成！');
  } catch (error) {
    console.error('❌ 种子数据运行失败:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

runSeed(); 
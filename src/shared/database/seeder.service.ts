import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 运行所有种子数据
   */
  async seed(): Promise<void> {
    this.logger.log('开始运行种子数据...');

    try {
      // 在事务中运行所有种子数据
      await this.dataSource.transaction(async (manager) => {
        // 这里可以添加具体的种子数据方法
        // await this.seedUsers(manager);
        // await this.seedRoles(manager);
        // await this.seedPermissions(manager);
        this.logger.log('暂无种子数据需要执行');
      });

      this.logger.log('种子数据运行完成');
    } catch (error) {
      this.logger.error('种子数据运行失败:', error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  async clean(): Promise<void> {
    this.logger.log('开始清空数据库...');

    try {
      const entities = this.dataSource.entityMetadatas;

      // 按照依赖关系顺序删除数据
      for (const entity of entities.reverse()) {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.clear();
        this.logger.log(`已清空表: ${entity.tableName}`);
      }

      this.logger.log('数据库清空完成');
    } catch (error) {
      this.logger.error('数据库清空失败:', error);
      throw error;
    }
  }

  /**
   * 重置数据库（清空 + 种子数据）
   */
  async reset(): Promise<void> {
    await this.clean();
    await this.seed();
  }

  /**
   * 检查数据库连接
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log('数据库连接正常');
      return true;
    } catch (error) {
      this.logger.error('数据库连接失败:', error);
      return false;
    }
  }

  // 示例种子数据方法
  // private async seedUsers(manager: EntityManager): Promise<void> {
  //   const userRepository = manager.getRepository(User);
  //   
  //   const adminUser = userRepository.create({
  //     username: 'admin',
  //     email: 'admin@example.com',
  //     password: await bcrypt.hash('admin123', 10),
  //     role: 'admin',
  //   });
  //   
  //   await userRepository.save(adminUser);
  //   this.logger.log('管理员用户创建完成');
  // }
} 
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { User, UserStatus } from '../entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱地址
   * @param includePassword 是否包含密码字段
   */
  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }

    return await queryBuilder.getOne();
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @param includePassword 是否包含密码字段
   */
  async findByUsername(username: string, includePassword = false): Promise<User | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.username = :username', { username });

    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }

    return await queryBuilder.getOne();
  }

  /**
   * 根据邮箱或用户名查找用户
   * @param emailOrUsername 邮箱或用户名
   * @param includePassword 是否包含密码字段
   */
  async findByEmailOrUsername(
    emailOrUsername: string, 
    includePassword = false
  ): Promise<User | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.email = :emailOrUsername OR user.username = :emailOrUsername', { 
        emailOrUsername 
      });

    if (includePassword) {
      queryBuilder.addSelect('user.password');
    }

    return await queryBuilder.getOne();
  }

  /**
   * 检查邮箱是否已存在
   * @param email 邮箱地址
   * @param excludeUserId 排除的用户ID（用于更新时检查）
   */
  async isEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeUserId) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * 检查用户名是否已存在
   * @param username 用户名
   * @param excludeUserId 排除的用户ID（用于更新时检查）
   */
  async isUsernameExists(username: string, excludeUserId?: string): Promise<boolean> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.username = :username', { username });

    if (excludeUserId) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * 根据状态查找用户
   * @param status 用户状态
   * @param limit 限制数量
   */
  async findByStatus(status: UserStatus, limit?: number): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .where('user.status = :status', { status });

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * 根据角色名称查找用户
   * @param roleName 角色名称
   * @param limit 限制数量
   */
  async findByRoleName(roleName: string, limit?: number): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName });

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }

  /**
   * 更新最后登录时间
   * @param userId 用户ID
   */
  async updateLastLoginAt(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * 更新邮箱验证状态
   * @param userId 用户ID
   * @param verified 验证状态
   */
  async updateEmailVerified(userId: string, verified = true): Promise<void> {
    await this.userRepository.update(userId, {
      emailVerified: verified,
    });
  }

  /**
   * 更新手机验证状态
   * @param userId 用户ID
   * @param verified 验证状态
   */
  async updatePhoneVerified(userId: string, verified = true): Promise<void> {
    await this.userRepository.update(userId, {
      phoneVerified: verified,
    });
  }

  /**
   * 搜索用户（支持用户名、邮箱、昵称搜索）
   * @param keyword 搜索关键词
   * @param limit 限制数量
   */
  async searchUsers(keyword: string, limit = 20): Promise<User[]> {
    return await this.userRepository.createQueryBuilder('user')
      .where('user.username ILIKE :keyword OR user.email ILIKE :keyword OR user.nickname ILIKE :keyword', {
        keyword: `%${keyword}%`
      })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .limit(limit)
      .getMany();
  }
} 
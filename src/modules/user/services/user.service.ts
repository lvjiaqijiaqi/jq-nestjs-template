import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import {
  UpdateUserProfileDto,
  AdminUpdateUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateUserStatusDto,
  UserQueryDto,
  BatchUpdateUserStatusDto,
  UserStatsResponseDto,
  UserDetailResponseDto,
  UserPermissionsResponseDto,
} from '../dto/user.dto';
import { PaginatedResponseDto } from '../../../common/dto/pagination.dto';
import { Role } from '../../auth/entities/role.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * 获取用户详情
   */
  async getUserDetail(userId: string): Promise<UserDetailResponseDto> {
    this.logger.debug(`获取用户详情 - userId: ${userId}`);

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.transformToDetailResponse(user);
  }

  /**
   * 更新用户资料
   */
  async updateProfile(
    userId: string,
    updateDto: UpdateUserProfileDto,
  ): Promise<UserDetailResponseDto> {
    this.logger.debug(`更新用户资料 - userId: ${userId}`);

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查手机号唯一性
    if (updateDto.phone) {
      const existingUser = await this.userRepo.findOne({
        where: { phone: updateDto.phone },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('手机号已被使用');
      }
    }

    // 更新用户信息
    Object.assign(user, updateDto);
    await this.userRepo.save(user);

    this.logger.log(`用户资料更新成功 - userId: ${userId}`);
    return this.transformToDetailResponse(user);
  }

  /**
   * 管理员更新用户信息
   */
  async adminUpdateUser(
    userId: string,
    updateDto: AdminUpdateUserDto,
  ): Promise<UserDetailResponseDto> {
    this.logger.debug(`管理员更新用户 - userId: ${userId}`);

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查邮箱唯一性
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(
        updateDto.email,
      );
      if (existingUser) {
        throw new ConflictException('邮箱已被使用');
      }
    }

    // 验证角色
    if (updateDto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: updateDto.roleId },
      });
      if (!role) {
        throw new BadRequestException('指定的角色不存在');
      }
      user.role = role;
      user.roleId = updateDto.roleId;
    }

    // 更新用户信息
    Object.assign(user, updateDto);
    await this.userRepo.save(user);

    this.logger.log(`管理员更新用户成功 - userId: ${userId}`);
    return this.transformToDetailResponse(user);
  }

  /**
   * 忘记密码（占位实现）
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    this.logger.debug(`处理忘记密码请求 - email: ${dto.email}`);

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`密码重置请求的邮箱不存在 - email: ${dto.email}`);
      return;
    }

    // TODO: 实现密码重置逻辑
    this.logger.log(`密码重置邮件已发送 - email: ${dto.email}`);
  }

  /**
   * 重置密码（占位实现）
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    this.logger.debug(`处理密码重置 - token: ${dto.token.substring(0, 8)}...`);

    // TODO: 实现密码重置逻辑
    this.logger.log('密码重置功能待实现');
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
  ): Promise<UserDetailResponseDto> {
    this.logger.debug(
      `更新用户状态 - userId: ${userId}, status: ${dto.status}`,
    );

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const oldStatus = user.status;
    user.status = dto.status;
    await this.userRepo.save(user);

    this.logger.log(
      `用户状态更新 - userId: ${userId}, ${oldStatus} -> ${dto.status}, reason: ${dto.reason || '无'}`,
    );

    return this.transformToDetailResponse(user);
  }

  /**
   * 分页查询用户
   */
  async findUsers(
    query: UserQueryDto,
  ): Promise<PaginatedResponseDto<UserDetailResponseDto>> {
    this.logger.debug(`分页查询用户 - query: ${JSON.stringify(query)}`);

    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    // 搜索条件
    if (query.keyword) {
      queryBuilder.andWhere(
        '(user.username LIKE :keyword OR user.email LIKE :keyword OR user.nickname LIKE :keyword)',
        { keyword: `%${query.keyword}%` },
      );
    }

    // 状态过滤
    if (query.status) {
      queryBuilder.andWhere('user.status = :status', { status: query.status });
    }

    // 角色过滤
    if (query.roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId: query.roleId });
    }

    // 排序
    queryBuilder.orderBy(`user.${query.sortBy}`, query.sortOrder);

    // 分页
    const [users, total] = await queryBuilder
      .skip(query.skip)
      .take(query.take)
      .getManyAndCount();

    const data = users.map((user) => this.transformToDetailResponse(user));

    return new PaginatedResponseDto(data, query.page, query.limit, total);
  }

  /**
   * 批量更新用户状态
   */
  async batchUpdateUserStatus(dto: BatchUpdateUserStatusDto): Promise<number> {
    this.logger.debug(
      `批量更新用户状态 - userIds: ${dto.userIds.length}, status: ${dto.status}`,
    );

    const users = await this.userRepo.find({
      where: { id: In(dto.userIds) },
    });

    if (users.length === 0) {
      throw new BadRequestException('未找到指定的用户');
    }

    // 更新状态
    await this.userRepo.update({ id: In(dto.userIds) }, { status: dto.status });

    this.logger.log(
      `批量更新用户状态成功 - count: ${users.length}, status: ${dto.status}, reason: ${dto.reason || '无'}`,
    );

    return users.length;
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<UserStatsResponseDto> {
    this.logger.debug('获取用户统计信息');

    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({
      where: { status: UserStatus.ACTIVE },
    });
    const inactiveUsers = await this.userRepo.count({
      where: { status: UserStatus.INACTIVE },
    });
    const suspendedUsers = await this.userRepo.count({
      where: { status: UserStatus.SUSPENDED },
    });

    // 今日新增用户
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNewUsers = await this.userRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today })
      .getCount();

    // 本月新增用户
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyNewUsers = await this.userRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :monthStart', { monthStart })
      .getCount();

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      todayNewUsers,
      monthlyNewUsers,
    };
  }

  /**
   * 获取用户权限信息
   */
  async getUserPermissions(
    userId: string,
  ): Promise<UserPermissionsResponseDto> {
    this.logger.debug(`获取用户权限 - userId: ${userId}`);

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const roles = user.role ? [user.role.name] : [];
    const userPermissions = user.role?.permissions?.map((p) => p.name) || [];

    // 构建功能权限映射
    const features: { [key: string]: boolean } = {};
    userPermissions.forEach((permission) => {
      if (permission.startsWith('user:')) {
        features.userManagement = true;
      }
      if (permission.startsWith('role:')) {
        features.roleManagement = true;
      }
      if (permission.startsWith('system:')) {
        features.systemManagement = true;
      }
    });

    return {
      roles,
      permissions: userPermissions,
      features,
    };
  }

  /**
   * 删除用户
   */
  async deleteUser(userId: string): Promise<void> {
    this.logger.debug(`删除用户 - userId: ${userId}`);

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 软删除
    await this.userRepo.softDelete(userId);

    this.logger.log(`用户删除成功 - userId: ${userId}`);
  }

  /**
   * 转换用户实体为详情响应DTO
   */
  private transformToDetailResponse(user: User): UserDetailResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      phone: user.phone,
      status: user.status,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            code: user.role.name, // 使用name作为code
            description: user.role.description,
          }
        : undefined,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

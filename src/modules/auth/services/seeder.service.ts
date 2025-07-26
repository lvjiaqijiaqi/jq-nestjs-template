import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role, RoleType } from '../entities/role.entity';
import { Permission, PermissionAction, PermissionResource } from '../entities/permission.entity';
import { User, UserStatus } from '../../user/entities/user.entity';

@Injectable()
export class AuthSeederService {
  private readonly logger = new Logger(AuthSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 运行认证相关的种子数据
   */
  async seed(): Promise<void> {
    this.logger.log('开始创建认证相关种子数据...');

    try {
      // 创建权限
      const permissions = await this.createPermissions();
      this.logger.log(`创建了 ${permissions.length} 个权限`);

      // 创建角色
      const roles = await this.createRoles(permissions);
      this.logger.log(`创建了 ${roles.length} 个角色`);

      // 创建默认用户
      await this.createDefaultUsers(roles);
      this.logger.log('创建了默认用户');

      this.logger.log('认证相关种子数据创建完成');
    } catch (error) {
      this.logger.error('认证种子数据创建失败:', error);
      throw error;
    }
  }

  /**
   * 创建基础权限
   */
  private async createPermissions(): Promise<Permission[]> {
    const permissionConfigs = [
      // 用户管理权限
      { resource: PermissionResource.USER, action: PermissionAction.READ, displayName: '查看用户', group: 'user_management' },
      { resource: PermissionResource.USER, action: PermissionAction.CREATE, displayName: '创建用户', group: 'user_management' },
      { resource: PermissionResource.USER, action: PermissionAction.UPDATE, displayName: '更新用户', group: 'user_management' },
      { resource: PermissionResource.USER, action: PermissionAction.DELETE, displayName: '删除用户', group: 'user_management' },
      { resource: PermissionResource.USER, action: PermissionAction.MANAGE, displayName: '管理用户', group: 'user_management' },

      // 角色管理权限
      { resource: PermissionResource.ROLE, action: PermissionAction.READ, displayName: '查看角色', group: 'role_management' },
      { resource: PermissionResource.ROLE, action: PermissionAction.CREATE, displayName: '创建角色', group: 'role_management' },
      { resource: PermissionResource.ROLE, action: PermissionAction.UPDATE, displayName: '更新角色', group: 'role_management' },
      { resource: PermissionResource.ROLE, action: PermissionAction.DELETE, displayName: '删除角色', group: 'role_management' },

      // 权限管理权限
      { resource: PermissionResource.PERMISSION, action: PermissionAction.READ, displayName: '查看权限', group: 'permission_management' },
      { resource: PermissionResource.PERMISSION, action: PermissionAction.MANAGE, displayName: '管理权限', group: 'permission_management' },

      // 系统管理权限
      { resource: PermissionResource.SYSTEM, action: PermissionAction.READ, displayName: '查看系统信息', group: 'system_management' },
      { resource: PermissionResource.SYSTEM, action: PermissionAction.MANAGE, displayName: '管理系统', group: 'system_management' },

      // 文件管理权限
      { resource: PermissionResource.FILE, action: PermissionAction.READ, displayName: '查看文件', group: 'file_management' },
      { resource: PermissionResource.FILE, action: PermissionAction.CREATE, displayName: '上传文件', group: 'file_management' },
      { resource: PermissionResource.FILE, action: PermissionAction.DELETE, displayName: '删除文件', group: 'file_management' },
    ];

    const permissions: Permission[] = [];

    for (const config of permissionConfigs) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { resource: config.resource, action: config.action }
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          name: `${config.resource}:${config.action}`,
          displayName: config.displayName,
          description: `${config.displayName}权限`,
          resource: config.resource,
          action: config.action,
          group: config.group,
          isActive: true,
        });

        const savedPermission = await this.permissionRepository.save(permission);
        permissions.push(savedPermission);
      } else {
        permissions.push(existingPermission);
      }
    }

    return permissions;
  }

  /**
   * 创建基础角色
   */
  private async createRoles(permissions: Permission[]): Promise<Role[]> {
    const roles: Role[] = [];

    // 超级管理员角色
    let adminRole = await this.roleRepository.findOne({ 
      where: { name: 'admin' },
      relations: ['permissions']
    });

    if (!adminRole) {
      adminRole = this.roleRepository.create({
        name: 'admin',
        displayName: '超级管理员',
        description: '拥有系统所有权限的超级管理员',
        type: RoleType.SYSTEM,
        level: 100,
        isActive: true,
        isDefault: false,
        permissions: permissions, // 拥有所有权限
      });

      adminRole = await this.roleRepository.save(adminRole);
    }
    roles.push(adminRole);

    // 普通用户角色
    let userRole = await this.roleRepository.findOne({ 
      where: { name: 'user' },
      relations: ['permissions']
    });

    if (!userRole) {
      const userPermissions = permissions.filter(p => 
        p.resource === PermissionResource.FILE && p.action === PermissionAction.READ ||
        p.resource === PermissionResource.FILE && p.action === PermissionAction.CREATE
      );

      userRole = this.roleRepository.create({
        name: 'user',
        displayName: '普通用户',
        description: '普通用户角色，拥有基础权限',
        type: RoleType.SYSTEM,
        level: 1,
        isActive: true,
        isDefault: true,
        permissions: userPermissions,
      });

      userRole = await this.roleRepository.save(userRole);
    }
    roles.push(userRole);

    // 版主角色
    let moderatorRole = await this.roleRepository.findOne({ 
      where: { name: 'moderator' },
      relations: ['permissions']
    });

    if (!moderatorRole) {
      const moderatorPermissions = permissions.filter(p => 
        p.resource === PermissionResource.USER && p.action === PermissionAction.READ ||
        p.resource === PermissionResource.USER && p.action === PermissionAction.UPDATE ||
        p.resource === PermissionResource.FILE && p.action !== PermissionAction.DELETE
      );

      moderatorRole = this.roleRepository.create({
        name: 'moderator',
        displayName: '版主',
        description: '版主角色，拥有内容管理权限',
        type: RoleType.CUSTOM,
        level: 50,
        isActive: true,
        isDefault: false,
        permissions: moderatorPermissions,
      });

      moderatorRole = await this.roleRepository.save(moderatorRole);
    }
    roles.push(moderatorRole);

    return roles;
  }

  /**
   * 创建默认用户
   */
  private async createDefaultUsers(roles: Role[]): Promise<void> {
    const adminRole = roles.find(r => r.name === 'admin');
    const userRole = roles.find(r => r.name === 'user');

    // 创建管理员用户
    const existingAdmin = await this.userRepository.findOne({ 
      where: { username: 'admin' } 
    });

    if (!existingAdmin && adminRole) {
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      const adminUser = this.userRepository.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        nickname: '系统管理员',
        status: UserStatus.ACTIVE,
        roleId: adminRole.id,
        emailVerified: true,
      });

      await this.userRepository.save(adminUser);
      this.logger.log('创建了管理员用户: admin / admin123456');
    }

    // 创建测试用户
    const existingTestUser = await this.userRepository.findOne({ 
      where: { username: 'testuser' } 
    });

    if (!existingTestUser && userRole) {
      const hashedPassword = await bcrypt.hash('123456', 12);
      
      const testUser = this.userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        nickname: '测试用户',
        status: UserStatus.ACTIVE,
        roleId: userRole.id,
        emailVerified: false,
      });

      await this.userRepository.save(testUser);
      this.logger.log('创建了测试用户: testuser / 123456');
    }
  }

  /**
   * 清理认证相关数据
   */
  async clean(): Promise<void> {
    this.logger.log('开始清理认证相关数据...');

    await this.userRepository.delete({});
    await this.roleRepository.delete({});
    await this.permissionRepository.delete({});

    this.logger.log('认证相关数据清理完成');
  }
} 
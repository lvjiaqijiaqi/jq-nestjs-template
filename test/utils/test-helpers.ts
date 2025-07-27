import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { User, UserStatus } from '../../src/modules/user/entities/user.entity';
import { Role, RoleType } from '../../src/modules/auth/entities/role.entity';
import { Permission } from '../../src/modules/auth/entities/permission.entity';

/**
 * 测试辅助工具类
 */
export class TestHelpers {
  private app: INestApplication;
  private dataSource: DataSource;

  constructor(app: INestApplication, dataSource: DataSource) {
    this.app = app;
    this.dataSource = dataSource;
  }

  /**
   * 创建认证用户并获取token
   */
  async createAuthenticatedUser(
    userData?: Partial<User>,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);

    // 创建默认角色（如果不存在）
    let userRole = await roleRepository.findOne({ where: { name: 'user' } });
    if (!userRole) {
      userRole = roleRepository.create({
        name: 'user',
        displayName: '普通用户',
        description: '普通用户角色',
        type: RoleType.CUSTOM,
        level: 1,
        isActive: true,
        isDefault: true,
        sort: 100,
      });
      await roleRepository.save(userRole);
    }

    // 创建用户
    const user = userRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      nickname: 'Test User',
      password: '$2b$10$test.hashed.password', // 已哈希的密码
      roleId: userRole.id,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: false,
      ...userData,
    });
    await userRepository.save(user);

    // 登录获取token
    const loginResponse = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: user.username,
        password: 'password123', // 原始密码
      });

    return {
      user,
      accessToken: loginResponse.body.data.accessToken,
      refreshToken: loginResponse.body.data.refreshToken,
    };
  }

  /**
   * 创建管理员用户并获取token
   */
  async createAdminUser(): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);

    // 创建管理员角色（如果不存在）
    let adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = roleRepository.create({
        name: 'admin',
        displayName: '管理员',
        description: '系统管理员',
        type: RoleType.SYSTEM,
        level: 999,
        isActive: true,
        isDefault: false,
        sort: 1,
      });
      await roleRepository.save(adminRole);
    }

    return this.createAuthenticatedUser({
      username: 'admin',
      email: 'admin@example.com',
      nickname: 'Admin User',
      roleId: adminRole.id,
    });
  }

  /**
   * 发送认证请求
   */
  async authenticatedRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    token: string,
  ) {
    const req = request(this.app.getHttpServer())[method](url);
    return req.set('Authorization', `Bearer ${token}`);
  }

  /**
   * 等待指定时间
   */
  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 创建测试权限
   */
  async createPermission(data: Partial<Permission> = {}): Promise<Permission> {
    const permissionRepository = this.dataSource.getRepository(Permission);
    const permission = permissionRepository.create({
      name: 'test:read',
      displayName: '测试读取',
      description: '测试权限',
      action: 'read',
      resource: 'test',
      group: 'test',
      sort: 100,
      isActive: true,
      ...data,
    });
    return await permissionRepository.save(permission);
  }

  /**
   * 为角色分配权限
   */
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.dataSource.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [roleId, permissionId],
    );
  }

  /**
   * 清理指定表的数据
   */
  async clearTable(tableName: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM ${tableName}`);
  }

  /**
   * 获取表的记录数
   */
  async getTableCount(tableName: string): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM ${tableName}`,
    );
    return parseInt(result[0].count);
  }

  /**
   * 验证API响应结构
   */
  validateApiResponse(response: any, expectedCode = 200) {
    expect(response.body).toHaveValidStructure();
    expect(response.body.code).toBe(expectedCode);
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.data).toBeDefined();
  }

  /**
   * 验证分页响应结构
   */
  validatePaginatedResponse(response: any, expectedCode = 200) {
    this.validateApiResponse(response, expectedCode);
    expect(response.body.data).toHaveProperty('items');
    expect(response.body.data).toHaveProperty('total');
    expect(response.body.data).toHaveProperty('page');
    expect(response.body.data).toHaveProperty('pageSize');
    expect(response.body.data).toHaveProperty('totalPages');
    expect(Array.isArray(response.body.data.items)).toBe(true);
  }

  /**
   * 验证错误响应
   */
  validateErrorResponse(
    response: any,
    expectedCode: number,
    expectedErrorCode?: string,
  ) {
    expect(response.status).toBe(expectedCode);
    expect(response.body).toHaveProperty('code');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');

    if (expectedErrorCode) {
      expect(response.body.code).toBe(expectedErrorCode);
    }
  }

  /**
   * 验证JWT Token格式
   */
  validateJwtToken(token: string) {
    expect(token).toBeJwtToken();
  }

  /**
   * 验证UUID格式
   */
  validateUuid(uuid: string) {
    expect(uuid).toBeUuid();
  }

  /**
   * 模拟时间
   */
  mockTime(date: Date | string) {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(date));
  }

  /**
   * 恢复真实时间
   */
  restoreTime() {
    jest.useRealTimers();
  }

  /**
   * 创建模拟函数
   */
  createMockFunction<T extends (...args: any[]) => any>(implementation?: T) {
    return jest.fn(implementation);
  }

  /**
   * 验证模拟函数调用
   */
  expectMockCalled(mockFn: jest.Mock, times = 1) {
    expect(mockFn).toHaveBeenCalledTimes(times);
  }

  /**
   * 验证模拟函数调用参数
   */
  expectMockCalledWith(mockFn: jest.Mock, ...args: any[]) {
    expect(mockFn).toHaveBeenCalledWith(...args);
  }
}

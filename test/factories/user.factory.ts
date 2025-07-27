import { faker } from '@faker-js/faker';
import { User, UserStatus } from '../../src/modules/user/entities/user.entity';
import { Role } from '../../src/modules/auth/entities/role.entity';

/**
 * 用户数据工厂
 */
export class UserFactory {
  /**
   * 创建用户测试数据
   */
  static build(overrides: Partial<User> = {}): Partial<User> {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      nickname: faker.person.fullName(),
      password: faker.internet.password(),
      avatar: faker.image.avatar(),
      phone: faker.phone.number(),
      status: UserStatus.ACTIVE,
      emailVerified: faker.datatype.boolean(),
      phoneVerified: faker.datatype.boolean(),
      lastLoginAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * 创建多个用户测试数据
   */
  static buildList(
    count: number,
    overrides: Partial<User> = {},
  ): Partial<User>[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  /**
   * 创建活跃用户
   */
  static buildActive(overrides: Partial<User> = {}): Partial<User> {
    return this.build({
      status: UserStatus.ACTIVE,
      emailVerified: true,
      ...overrides,
    });
  }

  /**
   * 创建未激活用户
   */
  static buildInactive(overrides: Partial<User> = {}): Partial<User> {
    return this.build({
      status: UserStatus.INACTIVE,
      emailVerified: false,
      ...overrides,
    });
  }

  /**
   * 创建已暂停用户
   */
  static buildSuspended(overrides: Partial<User> = {}): Partial<User> {
    return this.build({
      status: UserStatus.SUSPENDED,
      lastLoginAt: faker.date.past(),
      ...overrides,
    });
  }

  /**
   * 创建管理员用户
   */
  static buildAdmin(overrides: Partial<User> = {}): Partial<User> {
    return this.build({
      username: 'admin',
      email: 'admin@example.com',
      nickname: '管理员',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      ...overrides,
    });
  }

  /**
   * 创建测试用户
   */
  static buildTestUser(overrides: Partial<User> = {}): Partial<User> {
    return this.build({
      username: 'testuser',
      email: 'test@example.com',
      nickname: 'Test User',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: false,
      ...overrides,
    });
  }

  /**
   * 创建用户登录数据
   */
  static buildLoginData(overrides: any = {}) {
    return {
      username: 'testuser',
      password: 'password123',
      ...overrides,
    };
  }

  /**
   * 创建用户注册数据
   */
  static buildRegisterData(overrides: any = {}) {
    const password = faker.internet.password({ length: 12 });
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      nickname: faker.person.fullName(),
      password,
      confirmPassword: password,
      ...overrides,
    };
  }

  /**
   * 创建密码修改数据
   */
  static buildChangePasswordData(overrides: any = {}) {
    return {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
      ...overrides,
    };
  }

  /**
   * 创建用户更新数据
   */
  static buildUpdateData(overrides: any = {}) {
    return {
      nickname: faker.person.fullName(),
      avatar: faker.image.avatar(),
      phone: faker.phone.number(),
      ...overrides,
    };
  }
}

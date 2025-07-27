import { faker } from '@faker-js/faker';
import { Role, RoleType } from '../../src/modules/auth/entities/role.entity';

/**
 * 角色数据工厂
 */
export class RoleFactory {
  /**
   * 创建角色测试数据
   */
  static build(overrides: Partial<Role> = {}): Partial<Role> {
    return {
      name: faker.lorem.word(),
      displayName: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      type: RoleType.CUSTOM,
      level: faker.number.int({ min: 1, max: 100 }),
      isActive: true,
      isDefault: false,
      sort: faker.number.int({ min: 1, max: 1000 }),
      ...overrides,
    };
  }

  /**
   * 创建多个角色测试数据
   */
  static buildList(count: number, overrides: Partial<Role> = {}): Partial<Role>[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  /**
   * 创建系统角色
   */
  static buildSystem(overrides: Partial<Role> = {}): Partial<Role> {
    return this.build({
      type: RoleType.SYSTEM,
      level: faker.number.int({ min: 900, max: 999 }),
      ...overrides,
    });
  }

  /**
   * 创建自定义角色
   */
  static buildCustom(overrides: Partial<Role> = {}): Partial<Role> {
    return this.build({
      type: RoleType.CUSTOM,
      level: faker.number.int({ min: 1, max: 100 }),
      ...overrides,
    });
  }

  /**
   * 创建管理员角色
   */
  static buildAdmin(overrides: Partial<Role> = {}): Partial<Role> {
    return this.build({
      name: 'admin',
      displayName: '管理员',
      description: '系统管理员角色',
      type: RoleType.SYSTEM,
      level: 999,
      isActive: true,
      isDefault: false,
      sort: 1,
      ...overrides,
    });
  }

  /**
   * 创建普通用户角色
   */
  static buildUser(overrides: Partial<Role> = {}): Partial<Role> {
    return this.build({
      name: 'user',
      displayName: '普通用户',
      description: '普通用户角色',
      type: RoleType.CUSTOM,
      level: 1,
      isActive: true,
      isDefault: true,
      sort: 100,
      ...overrides,
    });
  }

  /**
   * 创建编辑者角色
   */
  static buildEditor(overrides: Partial<Role> = {}): Partial<Role> {
    return this.build({
      name: 'editor',
      displayName: '编辑者',
      description: '内容编辑者角色',
      type: RoleType.CUSTOM,
      level: 50,
      isActive: true,
      isDefault: false,
      sort: 50,
      ...overrides,
    });
  }

  /**
   * 创建访客角色
   */
  static buildGuest(overrides: Partial<Role> = {}): Partial<Role> {
    return this.build({
      name: 'guest',
      displayName: '访客',
      description: '访客角色',
      type: RoleType.CUSTOM,
      level: 10,
      isActive: true,
      isDefault: false,
      sort: 200,
      ...overrides,
    });
  }

  /**
   * 创建非活跃角色
   */
  static buildInactive(overrides: Partial<Role> = {}): Partial<Role> {
    return this.build({
      isActive: false,
      ...overrides,
    });
  }

  /**
   * 创建角色创建数据
   */
  static buildCreateData(overrides: any = {}) {
    return {
      name: faker.lorem.word().toLowerCase(),
      displayName: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      type: RoleType.CUSTOM,
      level: faker.number.int({ min: 1, max: 100 }),
      isActive: true,
      isDefault: false,
      sort: faker.number.int({ min: 1, max: 1000 }),
      ...overrides,
    };
  }

  /**
   * 创建角色更新数据
   */
  static buildUpdateData(overrides: any = {}) {
    return {
      displayName: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      level: faker.number.int({ min: 1, max: 100 }),
      isActive: faker.datatype.boolean(),
      sort: faker.number.int({ min: 1, max: 1000 }),
      ...overrides,
    };
  }
} 
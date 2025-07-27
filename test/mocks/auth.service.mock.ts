import { jest } from '@jest/globals';
import { User } from '../../src/modules/user/entities/user.entity';
import { Role } from '../../src/modules/auth/entities/role.entity';
import { UserFactory } from '../factories/user.factory';
import { RoleFactory } from '../factories/role.factory';

/**
 * AuthService Mock 实现
 */
export const mockAuthService = {
  // 用户验证
  validateUser: jest
    .fn()
    .mockImplementation(async (username: string, password: string) => {
      if (username === 'testuser' && password === 'password123') {
        return UserFactory.buildTestUser({ id: '1' });
      }
      if (username === 'admin' && password === 'password123') {
        return UserFactory.buildAdmin({ id: '2' });
      }
      return null;
    }),

  // 登录
  login: jest.fn().mockImplementation(async (user: User) => {
    return {
      accessToken: 'mock.access.token',
      refreshToken: 'mock.refresh.token',
      expiresIn: 3600,
    };
  }),

  // 注册
  register: jest.fn().mockImplementation(async (registerDto: any) => {
    const user = UserFactory.buildTestUser({
      id: '3',
      username: registerDto.username,
      email: registerDto.email,
      nickname: registerDto.nickname,
    });
    return {
      user,
      accessToken: 'mock.access.token',
      refreshToken: 'mock.refresh.token',
    };
  }),

  // 刷新令牌
  refreshToken: jest.fn().mockImplementation(async (refreshToken: string) => {
    if (refreshToken === 'mock.refresh.token') {
      return {
        accessToken: 'new.mock.access.token',
        refreshToken: 'new.mock.refresh.token',
        expiresIn: 3600,
      };
    }
    throw new Error('Invalid refresh token');
  }),

  // 获取用户信息
  getProfile: jest.fn().mockImplementation(async (userId: string) => {
    return UserFactory.buildTestUser({ id: userId });
  }),

  // 修改密码
  changePassword: jest
    .fn()
    .mockImplementation(async (userId: string, changePasswordDto: any) => {
      return { success: true };
    }),

  // 登出
  logout: jest.fn().mockImplementation(async (userId: string) => {
    return { success: true };
  }),

  // 验证令牌
  validateToken: jest.fn().mockImplementation(async (token: string) => {
    if (token === 'mock.access.token' || token === 'new.mock.access.token') {
      return UserFactory.buildTestUser({ id: '1' });
    }
    return null;
  }),
};

/**
 * UserService Mock 实现
 */
export const mockUserService = {
  // 查找用户
  findById: jest.fn().mockImplementation(async (id: string) => {
    return UserFactory.buildTestUser({ id });
  }),

  findByUsername: jest.fn().mockImplementation(async (username: string) => {
    if (username === 'testuser') {
      return UserFactory.buildTestUser({ username });
    }
    return null;
  }),

  findByEmail: jest.fn().mockImplementation(async (email: string) => {
    if (email === 'test@example.com') {
      return UserFactory.buildTestUser({ email });
    }
    return null;
  }),

  // 创建用户
  create: jest.fn().mockImplementation(async (createUserDto: any) => {
    return UserFactory.buildTestUser({
      id: '4',
      ...createUserDto,
    });
  }),

  // 更新用户
  update: jest
    .fn()
    .mockImplementation(async (id: string, updateUserDto: any) => {
      return UserFactory.buildTestUser({
        id,
        ...updateUserDto,
      });
    }),

  // 删除用户
  remove: jest.fn().mockImplementation(async (id: string) => {
    return { success: true };
  }),

  // 分页查询
  findMany: jest.fn().mockImplementation(async (query: any) => {
    const users = UserFactory.buildList(5);
    return {
      items: users,
      total: 5,
      page: query.page || 1,
      pageSize: query.pageSize || 10,
      totalPages: 1,
    };
  }),
};

/**
 * RoleService Mock 实现
 */
export const mockRoleService = {
  // 查找角色
  findById: jest.fn().mockImplementation(async (id: string) => {
    return RoleFactory.buildUser({ id });
  }),

  findByName: jest.fn().mockImplementation(async (name: string) => {
    if (name === 'user') {
      return RoleFactory.buildUser({ name });
    }
    if (name === 'admin') {
      return RoleFactory.buildAdmin({ name });
    }
    return null;
  }),

  // 创建角色
  create: jest.fn().mockImplementation(async (createRoleDto: any) => {
    return RoleFactory.build({
      id: '5',
      ...createRoleDto,
    });
  }),

  // 更新角色
  update: jest
    .fn()
    .mockImplementation(async (id: string, updateRoleDto: any) => {
      return RoleFactory.build({
        id,
        ...updateRoleDto,
      });
    }),

  // 删除角色
  remove: jest.fn().mockImplementation(async (id: string) => {
    return { success: true };
  }),

  // 获取用户角色权限
  getUserPermissions: jest.fn().mockImplementation(async (userId: string) => {
    return ['user:read', 'user:write', 'profile:read', 'profile:write'];
  }),

  // 检查权限
  hasPermission: jest
    .fn()
    .mockImplementation(async (userId: string, permission: string) => {
      const userPermissions = await mockRoleService.getUserPermissions(userId);
      return userPermissions.includes(permission);
    }),
};

/**
 * JWT Mock 实现
 */
export const mockJwtService = {
  sign: jest.fn().mockImplementation((payload: any) => {
    return 'mock.jwt.token';
  }),

  signAsync: jest.fn().mockImplementation(async (payload: any) => {
    return 'mock.jwt.token';
  }),

  verify: jest.fn().mockImplementation((token: string) => {
    if (token === 'mock.jwt.token') {
      return { sub: '1', username: 'testuser' };
    }
    throw new Error('Invalid token');
  }),

  verifyAsync: jest.fn().mockImplementation(async (token: string) => {
    if (token === 'mock.jwt.token') {
      return { sub: '1', username: 'testuser' };
    }
    throw new Error('Invalid token');
  }),

  decode: jest.fn().mockImplementation((token: string) => {
    return { sub: '1', username: 'testuser' };
  }),
};

/**
 * 缓存服务 Mock 实现
 */
export const mockCacheService = {
  get: jest.fn().mockImplementation(async (key: string) => {
    return null;
  }),

  set: jest
    .fn()
    .mockImplementation(async (key: string, value: any, options?: any) => {
      return 'OK';
    }),

  del: jest.fn().mockImplementation(async (key: string) => {
    return 1;
  }),

  clear: jest.fn().mockImplementation(async () => {
    return 'OK';
  }),

  getStats: jest.fn().mockImplementation(() => {
    return {
      hits: 10,
      misses: 2,
      keys: 5,
      ksize: 1024,
      vsize: 2048,
    };
  }),
};

/**
 * 队列服务 Mock 实现
 */
export const mockQueueService = {
  addJob: jest
    .fn()
    .mockImplementation(
      async (queueType: string, jobName: string, data: any) => {
        return {
          id: 'mock-job-id',
          name: jobName,
          data,
          opts: {},
        };
      },
    ),

  getQueueStats: jest.fn().mockImplementation(async (queueType: string) => {
    return {
      waiting: 5,
      active: 2,
      completed: 100,
      failed: 3,
      delayed: 1,
      paused: 0,
    };
  }),

  getAllQueueStats: jest.fn().mockImplementation(async () => {
    return {
      email: {
        waiting: 2,
        active: 1,
        completed: 50,
        failed: 1,
        delayed: 0,
        paused: 0,
      },
      file: {
        waiting: 3,
        active: 1,
        completed: 30,
        failed: 2,
        delayed: 1,
        paused: 0,
      },
      notification: {
        waiting: 0,
        active: 0,
        completed: 20,
        failed: 0,
        delayed: 0,
        paused: 0,
      },
    };
  }),

  pauseQueue: jest.fn().mockImplementation(async (queueType: string) => {
    return { success: true };
  }),

  resumeQueue: jest.fn().mockImplementation(async (queueType: string) => {
    return { success: true };
  }),
};

import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

// 元数据键
export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 设置接口所需权限
 * @param permissions 权限列表
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * 设置接口所需角色
 * @param roles 角色列表
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * 标记接口为公开接口，无需认证
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * 获取当前用户信息的装饰器
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

/**
 * 获取当前用户ID的装饰器
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    return request.user?.userId;
  },
);

/**
 * 需要认证的接口装饰器（组合装饰器）
 * @param permissions 可选的权限要求
 * @param roles 可选的角色要求
 */
export const Auth = (...permissions: string[]) => {
  const decorators = [
    UseGuards(JwtAuthGuard, PermissionsGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: '未授权访问' }),
    ApiForbiddenResponse({ description: '权限不足' }),
  ];

  if (permissions.length > 0) {
    decorators.push(RequirePermissions(...permissions));
  }

  return applyDecorators(...decorators);
};

/**
 * 需要特定角色的接口装饰器
 * @param roles 角色列表
 */
export const AuthRoles = (...roles: string[]) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, PermissionsGuard),
    RequireRoles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: '未授权访问' }),
    ApiForbiddenResponse({ description: '权限不足' }),
  );
};

/**
 * 管理员权限装饰器
 */
export const AdminAuth = () => AuthRoles('admin');

/**
 * 用户权限装饰器（普通用户或更高权限）
 */
export const UserAuth = () => AuthRoles('user', 'admin', 'moderator');

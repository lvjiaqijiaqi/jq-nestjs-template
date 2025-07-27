import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/auth.decorators';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取所需的权限和角色
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置权限要求，则允许访问
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 检查角色权限
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = user.role && requiredRoles.includes(user.role.name);
      if (!hasRole) {
        throw new ForbiddenException('权限不足：缺少所需角色');
      }
    }

    // 检查具体权限
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = user.role?.permissions || [];

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermission) {
        throw new ForbiddenException('权限不足：缺少所需权限');
      }
    }

    return true;
  }
}

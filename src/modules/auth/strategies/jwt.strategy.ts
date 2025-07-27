import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../user/repositories/user.repository';

export interface JwtPayload {
  sub: string; // 用户ID
  username: string;
  email: string;
  roleId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'fallback-secret',
      issuer: configService.get<string>('jwt.options.issuer') || undefined,
      audience: configService.get<string>('jwt.options.audience') || undefined,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId } = payload;

    // 查找用户并包含角色和权限信息
    const user = await this.userRepository.findOne(
      { id: userId },
      {
        relations: ['role', 'role.permissions'],
      },
    );

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('用户账号已被禁用');
    }

    // 返回用户信息（会被注入到 request.user 中）
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            displayName: user.role.displayName,
            permissions:
              user.role.permissions?.map((p) => p.fullPermission) || [],
          }
        : null,
      user, // 完整的用户对象
    };
  }
}

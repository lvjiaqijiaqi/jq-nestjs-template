import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'account', // 使用 account 字段作为用户名（支持邮箱或用户名）
      passwordField: 'password',
    });
  }

  async validate(account: string, password: string) {
    const user = await this.authService.validateUser(account, password);
    
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return user;
  }
} 
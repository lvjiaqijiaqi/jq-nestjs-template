import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'account', // 使用 account 字段作为用户名（支持邮箱或用户名）
      passwordField: 'password',
    });
  }

  async validate(account: string, password: string) {
    this.logger.debug(`🔐 LocalStrategy.validate 开始验证 - account: ${account}`);
    
    try {
      const user = await this.authService.validateUser(account, password);
      
      if (!user) {
        this.logger.warn(`❌ LocalStrategy.validate 验证失败 - account: ${account}`);
        throw new UnauthorizedException('账号或密码错误');
      }

      this.logger.log(`✅ LocalStrategy.validate 验证成功 - account: ${account}, userId: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`💥 LocalStrategy.validate 验证异常 - account: ${account}, error: ${error.message}`);
      throw error;
    }
  }
} 
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../user/repositories/user.repository';
import { User, UserStatus } from '../../user/entities/user.entity';
import { LoginDto, RegisterDto, ChangePasswordDto, LoginResponseDto, UserProfileDto } from '../dto/auth.dto';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 验证用户登录信息
   * @param account 账号（用户名或邮箱）
   * @param password 密码
   */
  async validateUser(account: string, password: string): Promise<any> {
    const user = await this.userRepository.findByEmailOrUsername(account, true);
    
    if (!user) {
      return null;
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('用户账号已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // 移除密码字段
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * 用户登录
   * @param loginDto 登录信息
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.account, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 更新最后登录时间
    await this.userRepository.updateLastLoginAt(user.id);

    // 生成令牌
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: await this.formatUserProfile(user),
    };
  }

  /**
   * 用户注册
   * @param registerDto 注册信息
   */
  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    // 验证密码确认
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('密码确认不匹配');
    }

    // 检查用户名是否已存在
    const existingUsername = await this.userRepository.isUsernameExists(registerDto.username);
    if (existingUsername) {
      throw new ConflictException('用户名已被使用');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.isEmailExists(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('邮箱地址已被使用');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // 创建用户
    const userData = {
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      nickname: registerDto.nickname,
      phone: registerDto.phone,
      status: UserStatus.ACTIVE,
    };

    const user = await this.userRepository.create(userData);

    // 生成令牌并返回
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: await this.formatUserProfile(user),
    };
  }

  /**
   * 刷新令牌
   * @param refreshToken 刷新令牌
   */
  async refreshTokens(refreshToken: string): Promise<Omit<LoginResponseDto, 'user'>> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refresh.secret'),
      });

      const user = await this.userRepository.findById(payload.sub);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      return await this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param changePasswordDto 修改密码信息
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId }, { select: ['id', 'password'] });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('当前密码错误');
    }

    // 验证新密码确认
    if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('新密码确认不匹配');
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    // 更新密码
    await this.userRepository.update(userId, { password: hashedNewPassword });
  }

  /**
   * 获取用户资料
   * @param userId 用户ID
   */
  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne(
      { id: userId },
      { relations: ['role', 'role.permissions'] }
    );

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return this.formatUserProfile(user);
  }

  /**
   * 生成访问令牌和刷新令牌
   * @param user 用户信息
   */
  private async generateTokens(user: User): Promise<Omit<LoginResponseDto, 'user'>> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      // 访问令牌
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
        issuer: this.configService.get<string>('jwt.options.issuer'),
        audience: this.configService.get<string>('jwt.options.audience'),
      }),
      // 刷新令牌
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refresh.secret'),
        expiresIn: this.configService.get<string>('jwt.refresh.expiresIn'),
        issuer: this.configService.get<string>('jwt.options.issuer'),
        audience: this.configService.get<string>('jwt.options.audience'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.parseExpiresIn(this.configService.get<string>('jwt.expiresIn', '7d')),
    };
  }

  /**
   * 格式化用户资料
   * @param user 用户实体
   */
  private async formatUserProfile(user: User): Promise<UserProfileDto> {
    // 确保加载了角色和权限信息
    const userWithRole = user.role ? user : await this.userRepository.findOne(
      { id: user.id },
      { relations: ['role', 'role.permissions'] }
    );

    if (!userWithRole) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: userWithRole.id,
      username: userWithRole.username,
      email: userWithRole.email,
      nickname: userWithRole.nickname,
      avatar: userWithRole.avatar,
      phone: userWithRole.phone,
      status: userWithRole.status,
      emailVerified: userWithRole.emailVerified,
      phoneVerified: userWithRole.phoneVerified,
      lastLoginAt: userWithRole.lastLoginAt,
      createdAt: userWithRole.createdAt,
      role: userWithRole.role ? {
        id: userWithRole.role.id,
        name: userWithRole.role.name,
        displayName: userWithRole.role.displayName,
        permissions: userWithRole.role.permissions?.map(p => p.fullPermission) || [],
      } : undefined,
    };
  }

  /**
   * 解析过期时间为秒数
   * @param expiresIn 过期时间字符串
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // 默认1小时

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's': return num;
      case 'm': return num * 60;
      case 'h': return num * 3600;
      case 'd': return num * 86400;
      default: return 3600;
    }
  }
} 
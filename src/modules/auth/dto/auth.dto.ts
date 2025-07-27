import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '登录账号（用户名或邮箱）',
    example: 'admin@example.com',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  account: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'john@example.com',
  })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({
    description: '确认密码',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  confirmPassword: string;

  @ApiProperty({
    description: '昵称',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'oldpassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  currentPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string;

  @ApiProperty({
    description: '确认新密码',
    example: 'newpassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  confirmNewPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: '邮箱地址',
    example: 'john@example.com',
  })
  @IsEmail()
  @MaxLength(100)
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: '重置令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: '新密码',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({
    description: '确认新密码',
    example: 'newpassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  confirmPassword: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;

  @ApiProperty({ description: '令牌类型', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: '过期时间（秒）', example: 3600 })
  expiresIn: number;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: string;
    username: string;
    email: string;
    nickname?: string;
    avatar?: string;
    role?: {
      id: string;
      name: string;
      displayName: string;
      permissions: string[];
    };
  };
}

export class UserProfileDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '邮箱地址' })
  email: string;

  @ApiProperty({ description: '昵称', required: false })
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  avatar?: string;

  @ApiProperty({ description: '手机号', required: false })
  phone?: string;

  @ApiProperty({ description: '用户状态' })
  status: string;

  @ApiProperty({ description: '邮箱验证状态' })
  emailVerified: boolean;

  @ApiProperty({ description: '手机验证状态' })
  phoneVerified: boolean;

  @ApiProperty({ description: '最后登录时间', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '角色信息', required: false })
  role?: {
    id: string;
    name: string;
    displayName: string;
    permissions: string[];
  };
}

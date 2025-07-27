import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsUrl,
  IsUUID,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { UserStatus } from '../entities/user.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/**
 * 用户信息更新DTO
 */
export class UpdateUserProfileDto {
  @ApiProperty({ description: '昵称', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '昵称不能超过100个字符' })
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsUrl({}, { message: '头像URL格式不正确' })
  @MaxLength(500, { message: '头像URL不能超过500个字符' })
  avatar?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '手机号格式不正确' })
  phone?: string;
}

/**
 * 管理员更新用户DTO
 */
export class AdminUpdateUserDto extends UpdateUserProfileDto {
  @ApiProperty({ description: '邮箱地址', required: false })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(100, { message: '邮箱不能超过100个字符' })
  email?: string;

  @ApiProperty({
    description: '用户状态',
    enum: UserStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: '用户状态格式不正确' })
  status?: UserStatus;

  @ApiProperty({ description: '角色ID', required: false })
  @IsOptional()
  @IsUUID('4', { message: '角色ID格式不正确' })
  roleId?: string;
}

/**
 * 密码重置请求DTO
 */
export class ForgotPasswordDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;
}

/**
 * 密码重置确认DTO
 */
export class ResetPasswordDto {
  @ApiProperty({ description: '重置令牌' })
  @IsString()
  token: string;

  @ApiProperty({ description: '新密码', example: 'newPassword123' })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  newPassword: string;
}

/**
 * 用户状态更新DTO
 */
export class UpdateUserStatusDto {
  @ApiProperty({
    description: '用户状态',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus, { message: '用户状态格式不正确' })
  status: UserStatus;

  @ApiProperty({ description: '状态变更原因', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '原因不能超过200个字符' })
  reason?: string;
}

/**
 * 用户查询DTO
 */
export class UserQueryDto extends PaginationDto {
  @ApiProperty({
    description: '搜索关键词（用户名/邮箱/昵称）',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    description: '用户状态过滤',
    enum: UserStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: '角色ID过滤', required: false })
  @IsOptional()
  @IsUUID('4')
  roleId?: string;

  // 继承PaginationDto的sortBy和sortOrder字段
}

/**
 * 批量操作DTO
 */
export class BatchUserOperationDto {
  @ApiProperty({ description: '用户ID列表' })
  @IsArray()
  @IsUUID('4', { each: true, message: '用户ID格式不正确' })
  userIds: string[];
}

/**
 * 批量更新用户状态DTO
 */
export class BatchUpdateUserStatusDto extends BatchUserOperationDto {
  @ApiProperty({
    description: '目标状态',
    enum: UserStatus,
  })
  @IsEnum(UserStatus, { message: '用户状态格式不正确' })
  status: UserStatus;

  @ApiProperty({ description: '操作原因', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '原因不能超过200个字符' })
  reason?: string;
}

/**
 * 用户统计响应DTO
 */
export class UserStatsResponseDto {
  @ApiProperty({ description: '总用户数' })
  totalUsers: number;

  @ApiProperty({ description: '活跃用户数' })
  activeUsers: number;

  @ApiProperty({ description: '已禁用用户数' })
  inactiveUsers: number;

  @ApiProperty({ description: '已暂停用户数' })
  suspendedUsers: number;

  @ApiProperty({ description: '今日新增用户数' })
  todayNewUsers: number;

  @ApiProperty({ description: '本月新增用户数' })
  monthlyNewUsers: number;
}

/**
 * 用户详情响应DTO
 */
export class UserDetailResponseDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '昵称' })
  nickname?: string;

  @ApiProperty({ description: '头像' })
  avatar?: string;

  @ApiProperty({ description: '手机号' })
  phone?: string;

  @ApiProperty({ description: '状态', enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ description: '角色信息' })
  role?: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };

  @ApiProperty({ description: '最后登录时间' })
  lastLoginAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 用户权限响应DTO
 */
export class UserPermissionsResponseDto {
  @ApiProperty({ description: '用户角色' })
  roles: string[];

  @ApiProperty({ description: '用户权限' })
  permissions: string[];

  @ApiProperty({ description: '功能权限' })
  features: {
    [key: string]: boolean;
  };
}

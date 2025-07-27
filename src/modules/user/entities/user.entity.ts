import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from '../../auth/entities/role.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// 角色现在使用独立的Role实体管理

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '用户名',
  })
  username: string;

  @ApiProperty({ description: '邮箱地址', example: 'john@example.com' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '邮箱地址',
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    comment: '密码哈希',
    select: false, // 默认查询时不包含密码字段
  })
  password: string;

  @ApiProperty({ description: '昵称', example: 'John Doe' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '昵称',
    nullable: true,
  })
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '头像URL',
    nullable: true,
  })
  avatar?: string;

  @ApiProperty({ description: '手机号', required: false })
  @Column({
    type: 'varchar',
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phone?: string;

  @ApiProperty({
    description: '用户状态',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    comment: '用户状态',
  })
  status: UserStatus;

  @ApiProperty({ description: '用户角色ID', required: false })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '用户角色ID',
    nullable: true,
  })
  roleId?: string;

  // 用户角色关联
  @ManyToOne(() => Role, (role) => role.users, {
    eager: true, // 自动加载角色信息
  })
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  @ApiProperty({ description: '最后登录时间', required: false })
  @Column({
    type: 'timestamp',
    comment: '最后登录时间',
    nullable: true,
  })
  lastLoginAt?: Date;

  @ApiProperty({ description: '邮箱验证状态', example: false })
  @Column({
    type: 'boolean',
    default: false,
    comment: '邮箱验证状态',
  })
  emailVerified: boolean;

  @ApiProperty({ description: '手机验证状态', example: false })
  @Column({
    type: 'boolean',
    default: false,
    comment: '手机验证状态',
  })
  phoneVerified: boolean;
}

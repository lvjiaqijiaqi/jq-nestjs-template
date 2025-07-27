import { Entity, Column, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Role } from './role.entity';

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // 完全控制
}

export enum PermissionResource {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  POST = 'post',
  COMMENT = 'comment',
  FILE = 'file',
  SYSTEM = 'system',
  ALL = 'all', // 所有资源
}

@Entity('permissions')
export class Permission extends BaseEntity {
  @ApiProperty({ description: '权限名称', example: 'user:create' })
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '权限名称',
  })
  name: string;

  @ApiProperty({ description: '权限显示名称', example: '创建用户' })
  @Column({
    type: 'varchar',
    length: 200,
    comment: '权限显示名称',
  })
  displayName: string;

  @ApiProperty({ description: '权限描述', required: false })
  @Column({
    type: 'text',
    comment: '权限描述',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: '权限动作',
    enum: PermissionAction,
    example: PermissionAction.CREATE,
  })
  @Column({
    type: 'enum',
    enum: PermissionAction,
    comment: '权限动作',
  })
  action: PermissionAction;

  @ApiProperty({
    description: '权限资源',
    enum: PermissionResource,
    example: PermissionResource.USER,
  })
  @Column({
    type: 'enum',
    enum: PermissionResource,
    comment: '权限资源',
  })
  resource: PermissionResource;

  @ApiProperty({ description: '权限分组', example: 'user_management' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '权限分组',
    default: 'default',
  })
  group: string;

  @ApiProperty({ description: '排序序号', example: 1 })
  @Column({
    type: 'int',
    comment: '排序序号',
    default: 0,
  })
  sort: number;

  @ApiProperty({ description: '是否启用', example: true })
  @Column({
    type: 'boolean',
    comment: '是否启用',
    default: true,
  })
  isActive: boolean;

  // 关联的角色
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  /**
   * 构造完整的权限字符串
   */
  get fullPermission(): string {
    return `${this.resource}:${this.action}`;
  }
}

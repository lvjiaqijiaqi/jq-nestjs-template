import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Permission } from './permission.entity';
import { User } from '../../user/entities/user.entity';

export enum RoleType {
  SYSTEM = 'system', // 系统角色，不可删除
  CUSTOM = 'custom', // 自定义角色，可编辑删除
}

@Entity('roles')
export class Role extends BaseEntity {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '角色名称',
  })
  name: string;

  @ApiProperty({ description: '角色显示名称', example: '管理员' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '角色显示名称',
  })
  displayName: string;

  @ApiProperty({ description: '角色描述', required: false })
  @Column({
    type: 'text',
    comment: '角色描述',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: '角色类型',
    enum: RoleType,
    example: RoleType.CUSTOM,
  })
  @Column({
    type: 'enum',
    enum: RoleType,
    comment: '角色类型',
    default: RoleType.CUSTOM,
  })
  type: RoleType;

  @ApiProperty({ description: '角色等级，数字越大权限越高', example: 1 })
  @Column({
    type: 'int',
    comment: '角色等级',
    default: 1,
  })
  level: number;

  @ApiProperty({ description: '是否启用', example: true })
  @Column({
    type: 'boolean',
    comment: '是否启用',
    default: true,
  })
  isActive: boolean;

  @ApiProperty({ description: '是否为默认角色', example: false })
  @Column({
    type: 'boolean',
    comment: '是否为默认角色',
    default: false,
  })
  isDefault: boolean;

  @ApiProperty({ description: '排序序号', example: 1 })
  @Column({
    type: 'int',
    comment: '排序序号',
    default: 0,
  })
  sort: number;

  // 角色拥有的权限
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  // 拥有此角色的用户
  @OneToMany(() => User, (user) => user.role)
  users: User[];

  /**
   * 检查角色是否拥有指定权限
   * @param permissionName 权限名称
   */
  hasPermission(permissionName: string): boolean {
    return (
      this.permissions?.some(
        (permission) =>
          permission.name === permissionName ||
          permission.fullPermission === permissionName,
      ) || false
    );
  }

  /**
   * 检查角色是否拥有指定资源的指定动作权限
   * @param resource 资源
   * @param action 动作
   */
  hasResourcePermission(resource: string, action: string): boolean {
    const permissionName = `${resource}:${action}`;
    return this.hasPermission(permissionName);
  }

  /**
   * 是否为系统角色（不可删除）
   */
  isSystemRole(): boolean {
    return this.type === RoleType.SYSTEM;
  }
}

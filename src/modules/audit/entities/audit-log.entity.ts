import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../user/entities/user.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  ENABLE = 'enable',
  DISABLE = 'disable',
  RESET_PASSWORD = 'reset_password',
  CHANGE_PASSWORD = 'change_password',
  BATCH_UPDATE = 'batch_update',
  BATCH_DELETE = 'batch_delete',
}

export enum AuditResult {
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

export enum AuditLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('audit_logs')
@Index(['userId', 'action'])
@Index(['resource', 'action'])
@Index(['createdAt'])
@Index(['level'])
export class AuditLog extends BaseEntity {
  @ApiProperty({ description: '操作用户ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '操作用户ID',
    nullable: true,
  })
  userId?: string;

  @ApiProperty({ description: '操作用户信息' })
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ApiProperty({ description: '操作动作', enum: AuditAction })
  @Column({
    type: 'enum',
    enum: AuditAction,
    comment: '操作动作',
  })
  action: AuditAction;

  @ApiProperty({ description: '操作资源类型', example: 'user' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '操作资源类型',
  })
  resource: string;

  @ApiProperty({ description: '资源ID', example: 'uuid' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '资源ID',
    nullable: true,
  })
  resourceId?: string;

  @ApiProperty({ description: '操作描述', example: '创建用户' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '操作描述',
  })
  description: string;

  @ApiProperty({ description: '操作结果', enum: AuditResult })
  @Column({
    type: 'enum',
    enum: AuditResult,
    default: AuditResult.SUCCESS,
    comment: '操作结果',
  })
  result: AuditResult;

  @ApiProperty({ description: '风险级别', enum: AuditLevel })
  @Column({
    type: 'enum',
    enum: AuditLevel,
    default: AuditLevel.LOW,
    comment: '风险级别',
  })
  level: AuditLevel;

  @ApiProperty({ description: '客户端IP地址' })
  @Column({
    type: 'varchar',
    length: 45,
    comment: '客户端IP地址',
    nullable: true,
  })
  ipAddress?: string;

  @ApiProperty({ description: '用户代理' })
  @Column({
    type: 'text',
    comment: '用户代理',
    nullable: true,
  })
  userAgent?: string;

  @ApiProperty({ description: '请求方法', example: 'POST' })
  @Column({
    type: 'varchar',
    length: 10,
    comment: '请求方法',
    nullable: true,
  })
  method?: string;

  @ApiProperty({ description: '请求路径', example: '/api/users' })
  @Column({
    type: 'varchar',
    length: 500,
    comment: '请求路径',
    nullable: true,
  })
  path?: string;

  @ApiProperty({ description: '请求参数（JSON格式）' })
  @Column({
    type: 'json',
    comment: '请求参数',
    nullable: true,
  })
  requestData?: any;

  @ApiProperty({ description: '响应数据（JSON格式）' })
  @Column({
    type: 'json',
    comment: '响应数据',
    nullable: true,
  })
  responseData?: any;

  @ApiProperty({ description: '错误信息' })
  @Column({
    type: 'text',
    comment: '错误信息',
    nullable: true,
  })
  errorMessage?: string;

  @ApiProperty({ description: '操作持续时间（毫秒）' })
  @Column({
    type: 'int',
    comment: '操作持续时间（毫秒）',
    nullable: true,
  })
  duration?: number;

  @ApiProperty({ description: '会话ID' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '会话ID',
    nullable: true,
  })
  sessionId?: string;

  @ApiProperty({ description: '设备信息' })
  @Column({
    type: 'json',
    comment: '设备信息',
    nullable: true,
  })
  deviceInfo?: {
    platform?: string;
    browser?: string;
    version?: string;
    mobile?: boolean;
  };

  @ApiProperty({ description: '地理位置信息' })
  @Column({
    type: 'json',
    comment: '地理位置信息',
    nullable: true,
  })
  location?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  @ApiProperty({ description: '额外元数据' })
  @Column({
    type: 'json',
    comment: '额外元数据',
    nullable: true,
  })
  metadata?: Record<string, any>;

  @ApiProperty({ description: '是否敏感操作' })
  @Column({
    type: 'boolean',
    default: false,
    comment: '是否敏感操作',
  })
  sensitive: boolean;

  @ApiProperty({ description: '数据变更前的值' })
  @Column({
    type: 'json',
    comment: '数据变更前的值',
    nullable: true,
  })
  oldValues?: Record<string, any>;

  @ApiProperty({ description: '数据变更后的值' })
  @Column({
    type: 'json',
    comment: '数据变更后的值',
    nullable: true,
  })
  newValues?: Record<string, any>;

  @ApiProperty({ description: '关联的操作ID' })
  @Column({
    type: 'varchar',
    length: 36,
    comment: '关联的操作ID',
    nullable: true,
  })
  correlationId?: string;

  @ApiProperty({ description: '操作模块' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '操作模块',
    nullable: true,
  })
  module?: string;

  @ApiProperty({ description: '操作子系统' })
  @Column({
    type: 'varchar',
    length: 100,
    comment: '操作子系统',
    nullable: true,
  })
  subsystem?: string;
}

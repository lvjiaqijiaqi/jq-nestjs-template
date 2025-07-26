import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @ApiProperty({ description: 'ID', example: '1' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({
    type: 'timestamp',
    comment: '创建时间',
  })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({
    type: 'timestamp',
    comment: '更新时间',
  })
  updatedAt: Date;

  @ApiProperty({ description: '删除时间', required: false })
  @DeleteDateColumn({
    type: 'timestamp',
    comment: '删除时间',
    nullable: true,
  })
  deletedAt?: Date;

  @ApiProperty({ description: '创建者ID', required: false })
  @Column({
    type: 'uuid',
    comment: '创建者ID',
    nullable: true,
  })
  createdBy?: string;

  @ApiProperty({ description: '更新者ID', required: false })
  @Column({
    type: 'uuid',
    comment: '更新者ID',
    nullable: true,
  })
  updatedBy?: string;

  @ApiProperty({ description: '版本号', example: 1 })
  @Column({
    type: 'int',
    comment: '版本号',
    default: 1,
  })
  version: number;
} 
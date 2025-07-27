import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, Min, Max, IsString, IsIn } from 'class-validator';

/**
 * 分页查询DTO
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: '页码，从1开始',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '页码必须是整数' })
  @IsPositive({ message: '页码必须大于0' })
  page: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量不能少于1' })
  @Max(100, { message: '每页数量不能超过100' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  @IsIn(['ASC', 'DESC'], { message: '排序方向只能是ASC或DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: '搜索关键词',
    example: 'test',
  })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  /**
   * 获取跳过的记录数
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * 获取获取的记录数
   */
  get take(): number {
    return this.limit;
  }
}

/**
 * 用户列表查询DTO
 */
export class UserListDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '用户状态',
    example: 'active',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'suspended'], { 
    message: '用户状态只能是active、inactive或suspended' 
  })
  status?: 'active' | 'inactive' | 'suspended';

  @ApiPropertyOptional({
    description: '角色ID',
    example: 'role_admin',
  })
  @IsOptional()
  @IsString({ message: '角色ID必须是字符串' })
  roleId?: string;

  @ApiPropertyOptional({
    description: '是否已验证邮箱',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  emailVerified?: boolean;
}

/**
 * 日期范围查询DTO
 */
export class DateRangeDto {
  @ApiPropertyOptional({
    description: '开始日期',
    example: '2025-01-01',
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: '结束日期',
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}

/**
 * 带日期范围的分页查询DTO
 */
export class PaginationWithDateDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '开始日期',
    example: '2025-01-01',
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: '结束日期',
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}

export class PaginationMeta {
  @ApiPropertyOptional({ description: '当前页码' })
  page: number;

  @ApiPropertyOptional({ description: '每页数量' })
  limit: number;

  @ApiPropertyOptional({ description: '总记录数' })
  total: number;

  @ApiPropertyOptional({ description: '总页数' })
  totalPages: number;

  @ApiPropertyOptional({ description: '是否有上一页' })
  hasPreviousPage: boolean;

  @ApiPropertyOptional({ description: '是否有下一页' })
  hasNextPage: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasPreviousPage = page > 1;
    this.hasNextPage = page < this.totalPages;
  }
}

export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({ description: '数据列表' })
  data: T[];

  @ApiPropertyOptional({ description: '分页信息' })
  meta: PaginationMeta;

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.meta = new PaginationMeta(page, limit, total);
  }
} 
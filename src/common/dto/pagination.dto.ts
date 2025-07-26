import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ 
    description: '页码', 
    default: 1, 
    minimum: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: '每页数量', 
    default: 10, 
    minimum: 1, 
    maximum: 100 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ 
    description: '排序方向', 
    enum: ['ASC', 'DESC'], 
    default: 'DESC' 
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
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
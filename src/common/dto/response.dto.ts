import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ERROR_CODES, ErrorCode } from '../constants/error-codes';

/**
 * 统一API响应格式
 */
export class ResponseDto<T = any> {
  @ApiProperty({ description: '响应状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  message: string;

  @ApiPropertyOptional({ description: '响应数据' })
  data?: T;

  @ApiProperty({
    description: '响应时间戳',
    example: '2025-07-27T08:00:00.000Z',
  })
  timestamp: string;

  @ApiPropertyOptional({ description: '请求路径', example: '/api/users' })
  path?: string;

  @ApiPropertyOptional({
    description: '请求ID，用于日志追踪',
    example: 'req_123456789',
  })
  requestId?: string;

  constructor(
    code: number,
    message: string,
    data?: T,
    path?: string,
    requestId?: string,
  ) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.requestId = requestId;
  }

  /**
   * 创建成功响应
   */
  static success<T>(
    data?: T,
    message = '操作成功',
    path?: string,
    requestId?: string,
  ): ResponseDto<T> {
    return new ResponseDto(200, message, data, path, requestId);
  }

  /**
   * 创建成功响应（带自定义错误码）
   */
  static successWithCode<T>(
    errorCode: ErrorCode,
    data?: T,
    path?: string,
    requestId?: string,
  ): ResponseDto<T> {
    return new ResponseDto(
      errorCode.code,
      errorCode.message,
      data,
      path,
      requestId,
    );
  }

  /**
   * 创建错误响应
   */
  static error(
    errorCode: ErrorCode,
    path?: string,
    requestId?: string,
    data?: any,
  ): ResponseDto {
    return new ResponseDto(
      errorCode.code,
      errorCode.message,
      data,
      path,
      requestId,
    );
  }

  /**
   * 创建自定义错误响应
   */
  static customError(
    code: number,
    message: string,
    path?: string,
    requestId?: string,
    data?: any,
  ): ResponseDto {
    return new ResponseDto(code, message, data, path, requestId);
  }
}

/**
 * 分页响应数据结构
 */
export class PaginationMetaDto {
  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrevious: boolean;

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasPrevious = page > 1;
    this.hasNext = page < this.totalPages;
  }
}

/**
 * 分页响应格式
 */
export class PaginatedResponseDto<T> extends ResponseDto<T[]> {
  @ApiProperty({ description: '分页信息', type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(
    data: T[],
    meta: PaginationMetaDto,
    message = '查询成功',
    path?: string,
    requestId?: string,
  ) {
    super(200, message, data, path, requestId);
    this.meta = meta;
  }

  /**
   * 创建分页响应
   */
  static create<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = '查询成功',
    path?: string,
    requestId?: string,
  ): PaginatedResponseDto<T> {
    const meta = new PaginationMetaDto(page, limit, total);
    return new PaginatedResponseDto(data, meta, message, path, requestId);
  }
}

/**
 * 列表查询响应（不分页）
 */
export class ListResponseDto<T> extends ResponseDto<T[]> {
  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  constructor(
    data: T[],
    total: number,
    message = '查询成功',
    path?: string,
    requestId?: string,
  ) {
    super(200, message, data, path, requestId);
    this.total = total;
  }

  /**
   * 创建列表响应
   */
  static create<T>(
    data: T[],
    total?: number,
    message = '查询成功',
    path?: string,
    requestId?: string,
  ): ListResponseDto<T> {
    return new ListResponseDto(
      data,
      total ?? data.length,
      message,
      path,
      requestId,
    );
  }
}

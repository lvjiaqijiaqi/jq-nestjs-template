import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({ description: '状态码' })
  code: number;

  @ApiProperty({ description: '响应消息' })
  message: string;

  @ApiProperty({ description: '响应数据' })
  data: T;

  @ApiProperty({ description: '时间戳' })
  timestamp: string;

  @ApiProperty({ description: '请求路径' })
  path: string;

  constructor(code: number, message: string, data: T, path?: string) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path || '';
  }

  static success<T>(data: T, message = 'Success', path?: string): ResponseDto<T> {
    return new ResponseDto(200, message, data, path);
  }

  static error(code: number, message: string, path?: string): ResponseDto<null> {
    return new ResponseDto(code, message, null, path);
  }
} 
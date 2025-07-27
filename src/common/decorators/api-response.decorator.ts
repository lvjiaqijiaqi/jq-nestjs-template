import { applyDecorators, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

/**
 * API成功响应装饰器
 * @param type 响应数据类型
 * @param description 描述
 */
export function ApiSuccessResponse<T>(
  type?: Type<T> | Function | [Function] | string,
  description: string = 'Success',
) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      type: ResponseDto,
    }),
  );
}

/**
 * API创建成功响应装饰器
 * @param type 响应数据类型
 * @param description 描述
 */
export function ApiCreatedResponse<T>(
  type?: Type<T> | Function | [Function] | string,
  description: string = 'Created successfully',
) {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description,
      type: ResponseDto,
    }),
  );
}

/**
 * API错误响应装饰器
 */
export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      type: ResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      type: ResponseDto,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden',
      type: ResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
      type: ResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      type: ResponseDto,
    }),
  );
}

/**
 * 完整的API文档装饰器
 * @param summary 接口摘要
 * @param tags 标签
 * @param successType 成功响应类型
 * @param successDescription 成功响应描述
 */
export function ApiDocumentation(
  summary: string,
  tags?: string | string[],
  successType?: Type<any> | Function | [Function] | string,
  successDescription?: string,
) {
  const decorators = [
    ApiOperation({ summary }),
    ApiSuccessResponse(successType, successDescription),
    ApiErrorResponses(),
  ];

  if (tags) {
    if (typeof tags === 'string') {
      decorators.unshift(ApiTags(tags));
    } else {
      decorators.unshift(ApiTags(...tags));
    }
  }

  return applyDecorators(...decorators);
}

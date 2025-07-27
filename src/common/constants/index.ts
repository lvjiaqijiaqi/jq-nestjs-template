/**
 * HTTP 状态码常量
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 响应消息常量
 */
export const RESPONSE_MESSAGES = {
  SUCCESS: '操作成功',
  CREATED: '创建成功',
  UPDATED: '更新成功',
  DELETED: '删除成功',
  FAILED: '操作失败',
  NOT_FOUND: '资源不存在',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '禁止访问',
  VALIDATION_ERROR: '数据验证失败',
  SERVER_ERROR: '服务器内部错误',
} as const;

/**
 * 缓存键常量
 */
export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  AUTH_PREFIX: 'auth:',
  CONFIG_PREFIX: 'config:',
} as const;

/**
 * 队列名称常量
 */
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  FILE_PROCESSING: 'file-processing-queue',
  NOTIFICATION: 'notification-queue',
} as const;

/**
 * 默认分页配置
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

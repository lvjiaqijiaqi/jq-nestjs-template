/**
 * 统一错误码管理
 * 错误码格式：AABBCC
 * AA - 模块代码 (10:通用, 20:认证, 30:用户, 40:权限, 50:文件, 90:系统)
 * BB - 业务代码 (01-99)
 * CC - 具体错误 (01-99)
 */

export const ERROR_CODES = {
  // 通用错误 (10xxxx)
  SUCCESS: { code: 100000, message: '操作成功' },
  UNKNOWN_ERROR: { code: 100001, message: '未知错误' },
  INVALID_PARAMS: { code: 100002, message: '参数错误' },
  INVALID_REQUEST: { code: 100003, message: '请求格式错误' },
  RATE_LIMIT_EXCEEDED: { code: 100004, message: '请求频率超限' },
  REQUEST_TIMEOUT: { code: 100005, message: '请求超时' },
  RESOURCE_NOT_FOUND: { code: 100006, message: '资源不存在' },
  METHOD_NOT_ALLOWED: { code: 100007, message: '请求方法不允许' },
  CONTENT_TOO_LARGE: { code: 100008, message: '请求内容过大' },

  // 认证相关错误 (20xxxx)
  AUTH_TOKEN_MISSING: { code: 200001, message: '缺少认证令牌' },
  AUTH_TOKEN_INVALID: { code: 200002, message: '认证令牌无效' },
  AUTH_TOKEN_EXPIRED: { code: 200003, message: '认证令牌已过期' },
  AUTH_REFRESH_TOKEN_INVALID: { code: 200004, message: '刷新令牌无效' },
  AUTH_CREDENTIALS_INVALID: { code: 200005, message: '用户名或密码错误' },
  AUTH_ACCOUNT_DISABLED: { code: 200006, message: '账号已被禁用' },
  AUTH_ACCOUNT_LOCKED: { code: 200007, message: '账号已被锁定' },
  AUTH_PASSWORD_WEAK: { code: 200008, message: '密码强度不足' },
  AUTH_LOGIN_FAILED: { code: 200009, message: '登录失败' },
  AUTH_LOGOUT_FAILED: { code: 200010, message: '登出失败' },

  // 用户相关错误 (30xxxx)
  USER_NOT_FOUND: { code: 300001, message: '用户不存在' },
  USER_ALREADY_EXISTS: { code: 300002, message: '用户已存在' },
  USER_EMAIL_EXISTS: { code: 300003, message: '邮箱已被使用' },
  USER_USERNAME_EXISTS: { code: 300004, message: '用户名已被使用' },
  USER_PHONE_EXISTS: { code: 300005, message: '手机号已被使用' },
  USER_PROFILE_UPDATE_FAILED: { code: 300006, message: '用户信息更新失败' },
  USER_PASSWORD_CHANGE_FAILED: { code: 300007, message: '密码修改失败' },
  USER_VERIFICATION_FAILED: { code: 300008, message: '用户验证失败' },

  // 权限相关错误 (40xxxx)
  PERMISSION_DENIED: { code: 400001, message: '权限不足' },
  ROLE_NOT_FOUND: { code: 400002, message: '角色不存在' },
  PERMISSION_NOT_FOUND: { code: 400003, message: '权限不存在' },
  ROLE_ASSIGNMENT_FAILED: { code: 400004, message: '角色分配失败' },
  PERMISSION_ASSIGNMENT_FAILED: { code: 400005, message: '权限分配失败' },

  // 文件相关错误 (50xxxx)
  FILE_NOT_FOUND: { code: 500001, message: '文件不存在' },
  FILE_UPLOAD_FAILED: { code: 500002, message: '文件上传失败' },
  FILE_TYPE_NOT_ALLOWED: { code: 500003, message: '文件类型不允许' },
  FILE_SIZE_EXCEEDED: { code: 500004, message: '文件大小超限' },
  FILE_DOWNLOAD_FAILED: { code: 500005, message: '文件下载失败' },

  // 数据库相关错误 (60xxxx)
  DATABASE_CONNECTION_FAILED: { code: 600001, message: '数据库连接失败' },
  DATABASE_QUERY_FAILED: { code: 600002, message: '数据库查询失败' },
  DATABASE_TRANSACTION_FAILED: { code: 600003, message: '数据库事务失败' },
  DATABASE_CONSTRAINT_VIOLATION: { code: 600004, message: '数据库约束违反' },
  DATABASE_DUPLICATE_ENTRY: { code: 600005, message: '数据重复' },

  // 外部服务错误 (70xxxx)
  EXTERNAL_SERVICE_UNAVAILABLE: { code: 700001, message: '外部服务不可用' },
  EXTERNAL_SERVICE_TIMEOUT: { code: 700002, message: '外部服务超时' },
  EXTERNAL_SERVICE_ERROR: { code: 700003, message: '外部服务错误' },
  EMAIL_SEND_FAILED: { code: 700004, message: '邮件发送失败' },
  SMS_SEND_FAILED: { code: 700005, message: '短信发送失败' },

  // 缓存相关错误 (80xxxx)
  CACHE_CONNECTION_FAILED: { code: 800001, message: '缓存连接失败' },
  CACHE_SET_FAILED: { code: 800002, message: '缓存设置失败' },
  CACHE_GET_FAILED: { code: 800003, message: '缓存获取失败' },
  CACHE_DELETE_FAILED: { code: 800004, message: '缓存删除失败' },

  // 系统错误 (90xxxx)
  SYSTEM_MAINTENANCE: { code: 900001, message: '系统维护中' },
  SYSTEM_OVERLOAD: { code: 900002, message: '系统负载过高' },
  SYSTEM_CONFIG_ERROR: { code: 900003, message: '系统配置错误' },
  SYSTEM_INTERNAL_ERROR: { code: 900004, message: '系统内部错误' },
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * 根据HTTP状态码获取默认错误信息
 */
export function getErrorByHttpStatus(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return ERROR_CODES.INVALID_REQUEST;
    case 401:
      return ERROR_CODES.AUTH_TOKEN_INVALID;
    case 403:
      return ERROR_CODES.PERMISSION_DENIED;
    case 404:
      return ERROR_CODES.RESOURCE_NOT_FOUND;
    case 405:
      return ERROR_CODES.METHOD_NOT_ALLOWED;
    case 408:
      return ERROR_CODES.REQUEST_TIMEOUT;
    case 413:
      return ERROR_CODES.CONTENT_TOO_LARGE;
    case 429:
      return ERROR_CODES.RATE_LIMIT_EXCEEDED;
    case 500:
      return ERROR_CODES.SYSTEM_INTERNAL_ERROR;
    case 502:
      return ERROR_CODES.EXTERNAL_SERVICE_UNAVAILABLE;
    case 503:
      return ERROR_CODES.SYSTEM_MAINTENANCE;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

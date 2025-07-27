# 📡 API文档说明

> 本文档详细介绍了NestJS样板工程的API设计规范、接口使用方法和Swagger文档系统。

## 📚 目录

- [API概述](#api概述)
- [统一响应格式](#统一响应格式)
- [认证授权](#认证授权)
- [错误处理](#错误处理)
- [版本控制](#版本控制)
- [分页查询](#分页查询)
- [核心API接口](#核心api接口)
- [Swagger文档](#swagger文档)
- [API使用示例](#api使用示例)

## 🎯 API概述

### 基本信息

- **基础URL**: `http://localhost:3000` (开发环境)
- **API版本**: v1
- **API前缀**: `/api/v1`
- **文档地址**: `/api/docs`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

### 设计原则

1. **RESTful设计** - 遵循REST架构风格
2. **统一响应格式** - 所有API返回统一的响应结构
3. **详细文档** - 完整的Swagger/OpenAPI文档
4. **版本控制** - 支持API版本管理
5. **安全优先** - 完整的认证授权机制
6. **错误处理** - 标准化的错误码和错误信息

## 📋 统一响应格式

### 成功响应

```typescript
interface ResponseDto<T> {
  code: number; // 响应码（200表示成功）
  message: string; // 响应消息
  data: T; // 响应数据
  timestamp: string; // 响应时间戳
}
```

**示例**：

```json
{
  "code": 200,
  "message": "用户信息获取成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "nickname": "John Doe",
    "status": "ACTIVE"
  },
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

### 分页响应

```typescript
interface PaginatedResponseDto<T> {
  code: number;
  message: string;
  data: {
    items: T[]; // 数据列表
    total: number; // 总记录数
    page: number; // 当前页码
    pageSize: number; // 每页大小
    totalPages: number; // 总页数
  };
  timestamp: string;
}
```

**示例**：

```json
{
  "code": 200,
  "message": "用户列表获取成功",
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "john_doe",
        "email": "john@example.com"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  },
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

### 错误响应

```json
{
  "code": 100001,
  "message": "用户不存在",
  "data": null,
  "timestamp": "2025-07-27T10:30:00.000Z",
  "path": "/api/v1/users/invalid-id"
}
```

## 🔐 认证授权

### 认证流程

1. **用户登录** - 获取访问令牌和刷新令牌
2. **请求头认证** - 在请求头中携带`Authorization: Bearer <token>`
3. **令牌刷新** - 使用刷新令牌获取新的访问令牌
4. **用户登出** - 使令牌失效

### 认证接口

#### 登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应**：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "admin",
      "nickname": "管理员"
    }
  },
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

#### 刷新令牌

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 获取个人信息

```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

#### 登出

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### 权限级别

- **Public** - 公开接口，无需认证
- **Authenticated** - 需要登录
- **Role-based** - 基于角色的访问控制
- **Permission-based** - 基于权限的访问控制

## ❌ 错误处理

### 错误码规范

错误码采用6位数字格式：`AABBCC`

- **AA**: 模块编号（10-99）
- **BB**: 错误类型（00-99）
- **CC**: 具体错误（01-99）

### 常用错误码

| 错误码 | 错误信息         | 说明                           |
| ------ | ---------------- | ------------------------------ |
| 100001 | 用户不存在       | 用户模块-查询错误-用户不存在   |
| 100002 | 用户名已存在     | 用户模块-创建错误-用户名重复   |
| 100003 | 邮箱已存在       | 用户模块-创建错误-邮箱重复     |
| 200001 | 用户名或密码错误 | 认证模块-登录错误-凭据无效     |
| 200002 | 访问令牌已过期   | 认证模块-令牌错误-令牌过期     |
| 200003 | 刷新令牌无效     | 认证模块-令牌错误-刷新令牌无效 |
| 300001 | 访问被拒绝       | 权限模块-访问错误-权限不足     |
| 300002 | 权限不足         | 权限模块-权限错误-操作权限不足 |

### HTTP状态码

| 状态码 | 说明                  | 使用场景       |
| ------ | --------------------- | -------------- |
| 200    | OK                    | 成功响应       |
| 201    | Created               | 资源创建成功   |
| 400    | Bad Request           | 请求参数错误   |
| 401    | Unauthorized          | 未认证         |
| 403    | Forbidden             | 权限不足       |
| 404    | Not Found             | 资源不存在     |
| 409    | Conflict              | 资源冲突       |
| 422    | Unprocessable Entity  | 数据验证失败   |
| 429    | Too Many Requests     | 请求过于频繁   |
| 500    | Internal Server Error | 服务器内部错误 |

## 🔄 版本控制

### URL版本控制

```http
GET /api/v1/users          # 版本1
GET /api/v2/users          # 版本2（未来版本）
```

### 版本标记

接口可以标记为废弃状态：

```typescript
@Get()
@ApiVersion('1')
@DeprecatedApiVersion('将在v2版本中移除，请使用/api/v2/users')
async getUsers(): Promise<ResponseDto<User[]>> {
  // 实现
}
```

### 版本兼容性

- **向后兼容** - 新版本保持对旧版本的兼容
- **废弃通知** - 废弃的API会提前通知
- **平滑迁移** - 提供迁移指南和过渡期

## 📄 分页查询

### 分页参数

```typescript
class PaginationDto {
  page: number = 1; // 页码（从1开始）
  pageSize: number = 10; // 每页大小（1-100）
  sortBy?: string; // 排序字段
  sortOrder?: 'ASC' | 'DESC' = 'DESC'; // 排序方向
}
```

### 使用示例

```http
GET /api/v1/users?page=1&pageSize=20&sortBy=createdAt&sortOrder=DESC
```

### 高级查询

```typescript
class UserListDto extends PaginationDto {
  keyword?: string; // 关键词搜索
  status?: UserStatus; // 状态筛选
  roleId?: string; // 角色筛选
  startDate?: string; // 开始日期
  endDate?: string; // 结束日期
}
```

**使用示例**：

```http
GET /api/v1/users?page=1&pageSize=10&keyword=john&status=ACTIVE&startDate=2025-01-01&endDate=2025-12-31
```

## 🔗 核心API接口

### 认证模块 (`/api/auth`)

| 方法 | 路径               | 描述         | 认证 |
| ---- | ------------------ | ------------ | ---- |
| POST | `/login`           | 用户登录     | 无   |
| POST | `/refresh`         | 刷新令牌     | 无   |
| GET  | `/profile`         | 获取个人信息 | 是   |
| PUT  | `/profile`         | 更新个人信息 | 是   |
| POST | `/change-password` | 修改密码     | 是   |
| POST | `/logout`          | 用户登出     | 是   |

### 用户管理 (`/api/users`)

| 方法   | 路径          | 描述           | 权限          |
| ------ | ------------- | -------------- | ------------- |
| GET    | `/`           | 获取用户列表   | `user:read`   |
| GET    | `/:id`        | 根据ID获取用户 | `user:read`   |
| POST   | `/`           | 创建用户       | `user:create` |
| PUT    | `/:id`        | 更新用户       | `user:update` |
| DELETE | `/:id`        | 删除用户       | `user:delete` |
| PUT    | `/:id/status` | 更新用户状态   | `user:update` |

### 角色管理 (`/api/roles`)

| 方法   | 路径               | 描述           | 权限          |
| ------ | ------------------ | -------------- | ------------- |
| GET    | `/`                | 获取角色列表   | `role:read`   |
| GET    | `/:id`             | 根据ID获取角色 | `role:read`   |
| POST   | `/`                | 创建角色       | `role:create` |
| PUT    | `/:id`             | 更新角色       | `role:update` |
| DELETE | `/:id`             | 删除角色       | `role:delete` |
| PUT    | `/:id/permissions` | 分配权限       | `role:update` |

### 权限管理 (`/api/permissions`)

| 方法   | 路径   | 描述           | 权限                |
| ------ | ------ | -------------- | ------------------- |
| GET    | `/`    | 获取权限列表   | `permission:read`   |
| GET    | `/:id` | 根据ID获取权限 | `permission:read`   |
| POST   | `/`    | 创建权限       | `permission:create` |
| PUT    | `/:id` | 更新权限       | `permission:update` |
| DELETE | `/:id` | 删除权限       | `permission:delete` |

### 系统监控 (`/api`)

| 方法 | 路径               | 描述         | 认证 |
| ---- | ------------------ | ------------ | ---- |
| GET  | `/health`          | 健康检查     | 无   |
| GET  | `/health/detailed` | 详细健康检查 | 是   |
| GET  | `/metrics`         | 系统指标     | 是   |
| GET  | `/info`            | 系统信息     | 无   |

### 队列管理 (`/api/queues`)

| 方法   | 路径            | 描述         | 权限           |
| ------ | --------------- | ------------ | -------------- |
| GET    | `/stats`        | 获取队列统计 | `queue:read`   |
| GET    | `/:type/jobs`   | 获取队列任务 | `queue:read`   |
| POST   | `/:type/pause`  | 暂停队列     | `queue:manage` |
| POST   | `/:type/resume` | 恢复队列     | `queue:manage` |
| DELETE | `/:type/clean`  | 清理队列     | `queue:manage` |

## 📖 Swagger文档

### 访问地址

- **开发环境**: http://localhost:3000/api/docs
- **JSON格式**: http://localhost:3000/api/docs-json

### 文档特性

1. **交互式测试** - 直接在文档中测试API
2. **模型定义** - 完整的请求/响应模型
3. **认证集成** - 支持JWT令牌认证
4. **错误示例** - 详细的错误响应示例
5. **代码生成** - 支持多种语言的客户端代码生成

### 自定义配置

```typescript
// Swagger配置
const config = new DocumentBuilder()
  .setTitle('NestJS样板工程API')
  .setDescription('企业级NestJS样板工程的API文档')
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: '请输入JWT令牌',
    },
    'access-token',
  )
  .addTag('认证管理', '用户认证和授权相关接口')
  .addTag('用户管理', '用户CRUD操作接口')
  .addTag('角色管理', '角色和权限管理接口')
  .addTag('系统监控', '系统健康检查和监控接口')
  .build();
```

## 🔧 API使用示例

### JavaScript/TypeScript

```typescript
// 定义API客户端
class ApiClient {
  private baseURL = 'http://localhost:3000/api/v1';
  private token: string | null = null;

  // 设置认证令牌
  setToken(token: string) {
    this.token = token;
  }

  // 通用请求方法
  private async request<T>(
    method: string,
    url: string,
    data?: any,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${url}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '请求失败');
    }

    return result;
  }

  // 用户登录
  async login(username: string, password: string) {
    const result = await this.request<any>('POST', '/auth/login', {
      username,
      password,
    });

    this.setToken(result.data.accessToken);
    return result;
  }

  // 获取用户列表
  async getUsers(page = 1, pageSize = 10) {
    return this.request<any>('GET', `/users?page=${page}&pageSize=${pageSize}`);
  }

  // 创建用户
  async createUser(userData: any) {
    return this.request<any>('POST', '/users', userData);
  }

  // 获取个人信息
  async getProfile() {
    return this.request<any>('GET', '/auth/profile');
  }
}

// 使用示例
const api = new ApiClient();

async function example() {
  try {
    // 登录
    const loginResult = await api.login('admin', 'admin123');
    console.log('登录成功:', loginResult);

    // 获取用户列表
    const users = await api.getUsers(1, 20);
    console.log('用户列表:', users);

    // 创建用户
    const newUser = await api.createUser({
      username: 'newuser',
      email: 'newuser@example.com',
      nickname: 'New User',
      password: 'password123',
    });
    console.log('用户创建成功:', newUser);
  } catch (error) {
    console.error('API调用失败:', error);
  }
}
```

### Python

```python
import requests
import json

class ApiClient:
    def __init__(self, base_url='http://localhost:3000/api/v1'):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()

    def set_token(self, token):
        """设置认证令牌"""
        self.token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })

    def request(self, method, url, data=None):
        """通用请求方法"""
        full_url = f"{self.base_url}{url}"

        if data:
            response = self.session.request(
                method,
                full_url,
                json=data,
                headers={'Content-Type': 'application/json'}
            )
        else:
            response = self.session.request(method, full_url)

        if response.status_code >= 400:
            error_data = response.json()
            raise Exception(f"API Error: {error_data.get('message', 'Unknown error')}")

        return response.json()

    def login(self, username, password):
        """用户登录"""
        result = self.request('POST', '/auth/login', {
            'username': username,
            'password': password
        })

        self.set_token(result['data']['accessToken'])
        return result

    def get_users(self, page=1, page_size=10):
        """获取用户列表"""
        return self.request('GET', f'/users?page={page}&pageSize={page_size}')

    def create_user(self, user_data):
        """创建用户"""
        return self.request('POST', '/users', user_data)

# 使用示例
if __name__ == '__main__':
    api = ApiClient()

    try:
        # 登录
        login_result = api.login('admin', 'admin123')
        print('登录成功:', login_result)

        # 获取用户列表
        users = api.get_users(1, 20)
        print('用户列表:', users)

        # 创建用户
        new_user = api.create_user({
            'username': 'pythonuser',
            'email': 'python@example.com',
            'nickname': 'Python User',
            'password': 'password123'
        })
        print('用户创建成功:', new_user)

    except Exception as e:
        print('API调用失败:', str(e))
```

### cURL命令

```bash
# 用户登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 获取用户列表（需要替换YOUR_TOKEN）
curl -X GET "http://localhost:3000/api/users?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建用户
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "nickname": "New User",
    "password": "password123"
  }'

# 获取个人信息
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# 更新用户状态
curl -X PUT http://localhost:3000/api/users/USER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "SUSPENDED"
  }'
```

## 🔍 调试技巧

### 1. 使用Swagger文档测试

1. 访问 http://localhost:3000/api/docs
2. 点击"Authorize"按钮输入JWT令牌
3. 选择要测试的接口
4. 填写参数并执行测试

### 2. 查看详细错误信息

开发环境下，错误响应会包含详细的堆栈信息：

```json
{
  "code": 500000,
  "message": "Internal server error",
  "data": null,
  "timestamp": "2025-07-27T10:30:00.000Z",
  "path": "/api/v1/users",
  "stack": "Error: Something went wrong..."
}
```

### 3. 启用请求日志

在开发环境中，所有HTTP请求都会被记录到控制台：

```
[2025-07-27T10:30:00.000Z] HTTP GET /api/users - 200 - 45ms
[2025-07-27T10:30:05.000Z] HTTP POST /api/users - 400 - 12ms
```

## 📚 相关文档

- [开发规范指南](./DEVELOPMENT_GUIDE.md)
- [快速开始指南](./QUICK_START.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [配置说明](./CONFIGURATION.md)
- [常见问题](./FAQ.md)

---

**提示**：API文档会随着项目发展持续更新，建议定期查看最新版本的Swagger文档。

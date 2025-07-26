# 项目架构说明

## 📁 目录结构

```
src/
├── app.controller.ts          # 应用控制器
├── app.module.ts              # 应用主模块
├── app.service.ts             # 应用服务
├── main.ts                    # 应用入口文件
├── common/                    # 通用组件
│   ├── constants/             # 常量定义
│   ├── decorators/            # 自定义装饰器
│   ├── dto/                   # 数据传输对象
│   │   ├── base.dto.ts        # 基础DTO
│   │   ├── pagination.dto.ts  # 分页DTO
│   │   └── response.dto.ts    # 统一响应DTO
│   ├── filters/               # 异常过滤器
│   ├── guards/                # 守卫
│   ├── interceptors/          # 拦截器
│   ├── middleware/            # 中间件
│   └── pipes/                 # 管道
├── config/                    # 配置文件
│   ├── app.config.ts          # 应用配置
│   ├── database.config.ts     # 数据库配置
│   ├── jwt.config.ts          # JWT配置
│   ├── redis.config.ts        # Redis配置
│   ├── validation.schema.ts   # 环境变量验证
│   └── index.ts               # 配置入口
├── modules/                   # 业务模块
├── shared/                    # 共享模块
│   └── config.module.ts       # 全局配置模块
└── utils/                     # 工具函数
    └── helper.util.ts         # 通用工具函数
```

## 🏗️ 架构特点

### 1. 配置管理
- ✅ 环境变量配置与验证
- ✅ 类型安全的配置模块
- ✅ 多环境支持
- ✅ 配置热重载

### 2. 项目结构
- ✅ 模块化设计
- ✅ 标准目录结构
- ✅ 路径别名配置
- ✅ 代码组织规范

### 3. 基础组件
- ✅ 统一响应格式
- ✅ 分页处理
- ✅ 数据验证管道
- ✅ 通用工具函数

### 4. 开发体验
- ✅ TypeScript 配置优化
- ✅ 类型安全保证
- ✅ 开发工具集成
- ✅ 代码规范

## 🎯 已完成功能

### 基础架构设置 ✅

#### 环境配置管理 ✅
- [x] 安装 `@nestjs/config`
- [x] 创建 `.env` 文件模板（env.example）
- [x] 配置不同环境（dev/test/prod）的环境变量
- [x] 类型安全的配置验证（使用 Joi）
- [x] 配置模块封装

#### 项目结构优化 ✅
- [x] 创建标准目录结构
- [x] 建立模块化架构规范
- [x] 设置路径别名映射（tsconfig.json）

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp env.example .env
# 编辑 .env 文件，填入实际配置
```

### 3. 启动开发服务器
```bash
npm run start:dev
```

### 4. 访问应用
- 应用地址: http://localhost:3000
- API 前缀: /api/v1 (可配置)

## 📝 配置说明

### 环境变量
所有环境变量都在 `env.example` 中有详细说明，主要包括：

- **应用配置**: 端口、名称、版本等
- **数据库配置**: 连接信息、池配置等
- **JWT配置**: 密钥、过期时间等
- **Redis配置**: 连接信息、缓存配置等
- **第三方服务**: OAuth、云存储等

### 配置验证
使用 Joi 进行环境变量验证，确保：
- 必填字段不为空
- 数据类型正确
- 取值范围合理
- 格式符合要求

## 🛠️ 下一步计划

根据 `DEVELOPMENT_ROADMAP.md` 继续实施：

1. **数据库集成** - ORM 配置和 Repository 模式
2. **认证授权系统** - JWT 认证和 RBAC 权限控制  
3. **安全中间件** - 数据验证和安全防护
4. **API 文档** - Swagger 集成和文档生成

---

**注意**: 本项目采用渐进式开发模式，功能模块按优先级逐步实现。 
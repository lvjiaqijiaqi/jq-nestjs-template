# 🚀 快速开始指南

> 欢迎使用NestJS通用样板工程！本指南将帮助您快速上手项目开发。

## 📋 项目概述

这是一个**企业级NestJS样板工程**，包含了现代Web应用开发所需的所有核心功能：

### 🎯 核心特性

- 🏗️ **完整的基础架构** - 模块化设计、TypeScript、环境配置
- 🗄️ **数据库集成** - TypeORM + MySQL，迁移管理，Repository模式
- 🔐 **认证授权系统** - JWT + RBAC权限控制，完整的用户角色管理
- 🛡️ **安全中间件** - 多层安全防护，请求限流，XSS防护
- 📡 **API设计** - Swagger文档，统一响应格式，版本控制
- ⚡ **性能优化** - Redis缓存，数据库优化，性能监控
- 🔧 **队列系统** - Bull队列，异步任务处理
- 📊 **监控健康检查** - Prometheus指标，健康检查端点
- 🧪 **测试框架** - Jest单元测试，E2E测试，覆盖率报告
- 🚀 **部署运维** - Docker容器化，CI/CD流水线，自动化部署

## ⚡ 快速开始

### 1. 环境要求

确保您的开发环境已安装：

- **Node.js** >= 18.x
- **npm** >= 9.x 或 **yarn** >= 1.22.x
- **Docker** >= 20.x（用于容器化部署）
- **MySQL** >= 8.0（或使用Docker）
- **Redis** >= 6.x（或使用Docker）

### 2. 克隆项目

```bash
# 克隆项目
git clone <your-repo-url>
cd jq-project-template

# 安装依赖
npm install
```

### 3. 环境配置

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件
nano .env
```

**关键配置项**：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=main

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置（生产环境必须更改）
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

### 4. 启动服务

#### 方式一：本地启动

```bash
# 启动MySQL和Redis（如果本地没有）
docker-compose -f docker-compose.dev.yml up -d mysql redis

# 数据库迁移
npm run migration:run

# 导入种子数据
npm run seed:auth

# 启动应用
npm run start:dev
```

#### 方式二：Docker启动（推荐）

```bash
# 启动完整开发环境
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f app
```

### 5. 验证安装

访问以下地址验证安装：

- **应用主页**: http://localhost:3000
- **API文档**: http://localhost:3000/api/docs
- **健康检查**: http://localhost:3000/api/health
- **数据库管理**: http://localhost:8080 (phpMyAdmin)
- **Redis管理**: http://localhost:8001 (RedisInsight)

### 6. 测试API

使用默认管理员账户测试：

```bash
# 登录接口
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 获取用户列表（需要登录后的token）
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 开发工作流

### 常用命令

```bash
# 开发相关
npm run start:dev          # 启动开发服务器
npm run start:debug        # 启动调试模式
npm run build              # 构建项目
npm run lint               # 代码检查
npm run format             # 代码格式化

# 数据库相关
npm run migration:create   # 创建迁移文件
npm run migration:run      # 执行迁移
npm run migration:revert   # 回滚迁移
npm run schema:sync        # 同步数据库结构
npm run seed:auth          # 导入认证相关种子数据

# 测试相关
npm run test               # 运行单元测试
npm run test:watch         # 监控模式运行测试
npm run test:cov           # 生成覆盖率报告
npm run test:e2e           # 运行E2E测试

# 部署相关
npm run docker:build       # 构建Docker镜像
npm run docker:up          # 启动Docker容器
npm run deploy:dev         # 部署到开发环境
```

### Git工作流

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 提交代码（遵循Conventional Commits规范）
git add .
git commit -m "feat(user): 添加用户导出功能"

# 推送代码
git push origin feature/your-feature-name

# 创建Pull Request
```

## 🏗️ 开发指南

### 1. 创建新模块

使用NestJS CLI快速创建模块：

```bash
# 创建完整模块
nest g module modules/product
nest g controller modules/product
nest g service modules/product

# 或使用一键生成
nest g resource modules/product
```

**标准模块结构**：

```
src/modules/product/
├── controllers/
│   └── product.controller.ts
├── services/
│   └── product.service.ts
├── entities/
│   └── product.entity.ts
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── product.dto.ts
├── repositories/
│   └── product.repository.ts
└── product.module.ts
```

### 2. 数据库实体

```typescript
// src/modules/product/entities/product.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/shared/database/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @ApiProperty({ description: '产品ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '产品名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '产品价格' })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: '产品描述' })
  @Column('text', { nullable: true })
  description: string;
}
```

### 3. DTO定义

```typescript
// src/modules/product/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Length, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: '产品名称', example: 'iPhone 15' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '产品价格', example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '产品描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
```

### 4. 控制器实现

```typescript
// src/modules/product/controllers/product.controller.ts
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ResponseDto } from '@/common/dto/response.dto';
import { Auth } from '@/modules/auth/decorators/auth.decorator';

@Controller('api/v1/products')
@ApiTags('产品管理')
@Auth(['admin', 'user'])
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: '创建产品' })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseDto<Product>> {
    const product = await this.productService.create(createProductDto);
    return ResponseDto.success(product, '产品创建成功');
  }

  @Get()
  @ApiOperation({ summary: '获取产品列表' })
  async findAll(@Query() pagination: PaginationDto): Promise<ResponseDto<any>> {
    const result = await this.productService.findAll(pagination);
    return ResponseDto.success(result, '产品列表获取成功');
  }
}
```

### 5. 服务层实现

```typescript
// src/modules/product/services/product.service.ts
import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Cacheable } from '@/shared/cache/decorators/cacheable.decorator';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  @Cacheable({
    key: 'products:list:#{page}:#{pageSize}',
    ttl: 300, // 5分钟缓存
  })
  async findAll(pagination: PaginationDto): Promise<any> {
    const [items, total] = await this.productRepository.findAndCount({
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }
}
```

## 🔐 认证和权限

### 使用认证装饰器

```typescript
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { RequirePermissions } from '@/modules/auth/decorators/permissions.decorator';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';

@Controller('api/v1/admin')
export class AdminController {
  // 需要admin角色
  @Get('dashboard')
  @Auth(['admin'])
  async getDashboard() {
    // 实现逻辑
  }

  // 需要特定权限
  @Post('users')
  @RequirePermissions(['user:create'])
  async createUser() {
    // 实现逻辑
  }

  // 获取当前用户信息
  @Get('profile')
  @Auth()
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

### 公开接口

```typescript
import { Public } from '@/modules/auth/decorators/public.decorator';

@Controller('api/v1/public')
export class PublicController {
  @Get('info')
  @Public() // 公开接口，不需要认证
  async getInfo() {
    return { message: '这是公开接口' };
  }
}
```

## 📊 缓存使用

```typescript
import { Cacheable, CacheEvict, CachePut } from '@/shared/cache/decorators';

@Injectable()
export class UserService {
  // 缓存查询结果
  @Cacheable({
    key: 'user:#{id}',
    ttl: 3600, // 1小时
    condition: '#{id} != null',
  })
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  // 更新时清除缓存
  @CacheEvict({
    key: 'user:#{id}',
  })
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.getUserById(id);
  }

  // 更新缓存
  @CachePut({
    key: 'user:#{result.id}',
  })
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.save(createUserDto);
  }
}
```

## 🔧 队列使用

```typescript
import { Injectable } from '@nestjs/common';
import { QueueService } from '@/shared/queue/services/queue.service';

@Injectable()
export class EmailService {
  constructor(private readonly queueService: QueueService) {}

  async sendWelcomeEmail(userId: string, email: string): Promise<void> {
    await this.queueService.addJob('email', 'send-welcome', {
      userId,
      email,
      template: 'welcome',
    });
  }

  async sendBulkEmail(
    emails: string[],
    subject: string,
    content: string,
  ): Promise<void> {
    await this.queueService.addJob(
      'email',
      'send-bulk',
      {
        emails,
        subject,
        content,
      },
      {
        delay: 5000, // 延迟5秒执行
        attempts: 3, // 重试3次
      },
    );
  }
}
```

## 📝 测试编写

### 单元测试

```typescript
// src/modules/product/services/product.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductFactory } from '../../../test/factories/product.factory';

describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get(ProductRepository);
  });

  describe('create', () => {
    it('应该成功创建产品', async () => {
      // Arrange
      const createProductDto = ProductFactory.buildCreateData();
      const expectedProduct = ProductFactory.build(createProductDto);
      repository.create.mockReturnValue(expectedProduct);
      repository.save.mockResolvedValue(expectedProduct);

      // Act
      const result = await service.create(createProductDto);

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(repository.save).toHaveBeenCalledWith(expectedProduct);
    });
  });
});
```

### E2E测试

```typescript
// test/product.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestHelpers } from './utils/test-helpers';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const { accessToken } = await TestHelpers.createAuthenticatedUser(app);
    authToken = accessToken;
  });

  describe('/products (POST)', () => {
    it('应该成功创建产品', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          description: 'Test Description',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveValidStructure();
          expect(res.body.data.name).toBe('Test Product');
        });
    });
  });
});
```

## 🚀 部署

### 开发环境部署

```bash
# 使用Docker Compose
./scripts/deploy.sh dev --build

# 或手动部署
docker-compose -f docker-compose.dev.yml up -d
```

### 生产环境部署

```bash
# 配置生产环境
./scripts/env-setup.sh prod --interactive

# 部署到生产环境
./scripts/deploy.sh prod --build --backup --migrate

# 监控部署状态
./scripts/deploy.sh prod --monitor
```

## 📚 常用资源

### 内置功能

- **用户管理**: 完整的用户CRUD操作
- **角色权限**: 基于RBAC的权限控制
- **认证系统**: JWT + 刷新令牌机制
- **缓存系统**: Redis多策略缓存
- **队列系统**: 异步任务处理
- **监控系统**: 健康检查和性能指标
- **文档系统**: 自动生成的API文档

### 工具和脚本

- **环境配置**: `./scripts/env-setup.sh`
- **部署脚本**: `./scripts/deploy.sh`
- **测试脚本**: `./scripts/test.sh`

### API端点

- **认证相关**: `/api/auth/*`
- **用户管理**: `/api/users/*`
- **角色权限**: `/api/roles/*`, `/api/permissions/*`
- **健康检查**: `/api/health`
- **监控指标**: `/api/metrics`
- **队列管理**: `/api/queues/*`

## ❓ 常见问题

### Q: 如何添加新的环境变量？

1. 在`.env`文件中添加变量
2. 在`src/config/validation.schema.ts`中添加验证规则
3. 在相应的配置文件中使用

### Q: 如何自定义错误码？

编辑`src/common/constants/error-codes.ts`文件，按照现有格式添加新的错误码。

### Q: 如何添加新的权限？

1. 在数据库中添加权限记录
2. 或修改`src/shared/database/seeds/auth.seed.ts`文件
3. 重新运行种子数据

### Q: 如何自定义缓存策略？

在服务方法上使用`@Cacheable`、`@CacheEvict`、`@CachePut`装饰器，参考现有实现。

## 📞 获取帮助

- **文档**: 查看`docs/`目录下的详细文档
- **示例**: 参考现有的`user`和`auth`模块实现
- **问题**: 查看项目Issue或创建新Issue

---

🎉 **恭喜！您已经掌握了NestJS样板工程的基本使用方法。开始您的开发之旅吧！**

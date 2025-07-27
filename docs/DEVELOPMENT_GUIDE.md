# 🚀 开发规范指南

> 本文档提供了NestJS样板工程的完整开发规范和最佳实践，帮助开发者快速上手项目开发。

## 📚 目录

- [代码规范](#代码规范)
- [项目结构](#项目结构)
- [命名规范](#命名规范)
- [配置规范](#配置规范)
- [API设计规范](#api设计规范)
- [数据库规范](#数据库规范)
- [测试规范](#测试规范)
- [Git规范](#git规范)
- [最佳实践](#最佳实践)

## 🎯 代码规范

### ESLint 规则

项目使用严格的ESLint规则确保代码质量：

```javascript
// ✅ 推荐
async function getUserById(id: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  return user;
}

// ❌ 不推荐
async function getUserById(id) {
  const user = await this.userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  return user;
}
```

### 代码风格规范

1. **行长度限制**：最大120字符
2. **函数长度**：建议不超过50行
3. **文件长度**：建议不超过300行
4. **圈复杂度**：不超过10
5. **参数数量**：不超过4个

### TypeScript 规范

```typescript
// ✅ 推荐：明确的类型定义
interface CreateUserDto {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly nickname?: string;
}

// ✅ 推荐：使用联合类型
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// ✅ 推荐：使用泛型
class BaseRepository<T> {
  async findById(id: string): Promise<T | null> {
    // implementation
  }
}

// ❌ 不推荐：使用any类型
function processData(data: any): any {
  // implementation
}
```

## 🏗️ 项目结构

### 目录结构规范

```
src/
├── modules/                    # 业务模块
│   ├── auth/                  # 认证模块
│   │   ├── controllers/       # 控制器
│   │   ├── services/          # 服务层
│   │   ├── entities/          # 数据实体
│   │   ├── dto/               # 数据传输对象
│   │   ├── guards/            # 守卫
│   │   └── auth.module.ts     # 模块定义
│   ├── user/                  # 用户模块
│   └── ...                    # 其他业务模块
├── common/                     # 通用组件
│   ├── decorators/            # 自定义装饰器
│   ├── filters/               # 异常过滤器
│   ├── guards/                # 通用守卫
│   ├── interceptors/          # 拦截器
│   ├── middleware/            # 中间件
│   ├── pipes/                 # 管道
│   └── constants/             # 常量定义
├── shared/                     # 共享模块
│   ├── database/              # 数据库相关
│   ├── cache/                 # 缓存相关
│   └── queue/                 # 队列相关
├── config/                     # 配置文件
├── utils/                      # 工具函数
└── main.ts                     # 应用入口
```

### 模块开发规范

1. **每个业务模块应包含**：
   - `controllers/` - 控制器层
   - `services/` - 业务逻辑层
   - `entities/` - 数据实体
   - `dto/` - 数据传输对象
   - `module.ts` - 模块定义

2. **模块命名**：使用PascalCase，如 `UserModule`

3. **文件命名**：使用kebab-case，如 `user.service.ts`

## 📝 命名规范

### 类和接口命名

```typescript
// ✅ 类命名：PascalCase
class UserService {}
class AuthController {}

// ✅ 接口命名：PascalCase（不使用I前缀）
interface User {
  id: string;
  username: string;
}

// ✅ 枚举命名：PascalCase
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
```

### 方法和变量命名

```typescript
// ✅ 方法命名：camelCase，动词开头
async createUser(createUserDto: CreateUserDto): Promise<User> {}
async findUserById(id: string): Promise<User | null> {}
async updateUserStatus(id: string, status: UserStatus): Promise<void> {}

// ✅ 变量命名：camelCase
const userName = 'john_doe';
const isAuthenticated = true;
const userList = [];

// ✅ 常量命名：UPPER_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 10;
```

### 文件命名规范

```
user.controller.ts      # 控制器
user.service.ts         # 服务
user.entity.ts          # 实体
user.dto.ts             # DTO
user.guard.ts           # 守卫
user.decorator.ts       # 装饰器
user.interceptor.ts     # 拦截器
user.middleware.ts      # 中间件
user.pipe.ts            # 管道
user.filter.ts          # 过滤器
user.spec.ts            # 单元测试
user.e2e-spec.ts        # E2E测试
```

## ⚙️ 配置规范

### 环境变量规范

1. **命名规范**：使用UPPER_CASE + 下划线
2. **分组规范**：使用前缀分组相关配置
3. **默认值**：提供合理的默认值
4. **验证规范**：使用Joi进行配置验证

```typescript
// ✅ 配置分组示例
// 应用配置
NODE_ENV=development
APP_NAME=jq-project-template
APP_VERSION=1.0.0
PORT=3000

// 数据库配置
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=main

// Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

// JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
```

### 配置文件组织

```typescript
// config/database.config.ts
export const databaseConfig = registerAs('database', () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}));

// config/validation.schema.ts
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  // ... 其他验证规则
});
```

## 🌐 API设计规范

### RESTful API规范

```typescript
// ✅ 推荐的API设计
@Controller('api/v1/users')
export class UserController {
  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiSuccessResponse(UserListDto, '用户列表获取成功')
  async getUsers(
    @Query() query: PaginationDto,
  ): Promise<ResponseDto<UserListDto>> {
    // implementation
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户' })
  @ApiSuccessResponse(UserDto, '用户信息获取成功')
  async getUserById(@Param('id') id: string): Promise<ResponseDto<UserDto>> {
    // implementation
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiCreatedResponse(UserDto, '用户创建成功')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseDto<UserDto>> {
    // implementation
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiSuccessResponse(UserDto, '用户更新成功')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<UserDto>> {
    // implementation
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiSuccessResponse(null, '用户删除成功')
  async deleteUser(@Param('id') id: string): Promise<ResponseDto<null>> {
    // implementation
  }
}
```

### 响应格式规范

```typescript
// 统一响应格式
interface ResponseDto<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

// 分页响应格式
interface PaginatedResponseDto<T> {
  code: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  timestamp: string;
}
```

### 错误处理规范

```typescript
// 使用统一的错误码
export const ERROR_CODES = {
  // 用户相关 10xxxx
  USER_NOT_FOUND: 100001,
  USER_ALREADY_EXISTS: 100002,

  // 认证相关 20xxxx
  INVALID_CREDENTIALS: 200001,
  TOKEN_EXPIRED: 200002,

  // 权限相关 30xxxx
  ACCESS_DENIED: 300001,
  INSUFFICIENT_PERMISSIONS: 300002,
};

// 自定义异常类
export class BusinessException extends HttpException {
  constructor(code: number, message: string) {
    super({ code, message }, HttpStatus.BAD_REQUEST);
  }
}
```

### Swagger文档规范

```typescript
// ✅ 完整的Swagger文档注解
@Controller('api/v1/users')
@ApiTags('用户管理')
@ApiBearerAuth()
export class UserController {
  @Post()
  @ApiOperation({
    summary: '创建用户',
    description: '创建新的用户账户，需要管理员权限',
  })
  @ApiBody({
    type: CreateUserDto,
    description: '用户创建信息',
  })
  @ApiCreatedResponse({
    description: '用户创建成功',
    type: UserDto,
  })
  @ApiErrorResponses([
    { status: 400, description: '请求参数错误' },
    { status: 401, description: '未授权' },
    { status: 403, description: '权限不足' },
    { status: 409, description: '用户已存在' },
  ])
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseDto<UserDto>> {
    // implementation
  }
}
```

## 🗄️ 数据库规范

### 实体定义规范

```typescript
@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户名' })
  @Column({ length: 50, unique: true })
  @Index('idx_user_username')
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ length: 100, unique: true })
  @Index('idx_user_email')
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @ApiProperty({ description: '昵称' })
  @Column({ length: 100, nullable: true })
  nickname: string;

  @ApiProperty({ description: '用户状态' })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Repository模式规范

```typescript
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'status'],
    });
  }

  async findActiveUsers(pagination: PaginationDto): Promise<[User[], number]> {
    return this.findAndCount({
      where: { status: UserStatus.ACTIVE },
      skip: (pagination.page - 1) * pagination.pageSize,
      take: pagination.pageSize,
      order: { createdAt: 'DESC' },
    });
  }
}
```

### 迁移规范

```typescript
// migrations/xxxx-create-user-table.ts
export class CreateUserTable1234567890 implements MigrationInterface {
  name = 'CreateUserTable1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid()',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          // ... 其他字段
        ],
        indices: [
          {
            name: 'idx_user_username',
            columnNames: ['username'],
          },
          {
            name: 'idx_user_email',
            columnNames: ['email'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

## 🧪 测试规范

### 单元测试规范

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  describe('createUser', () => {
    it('应该成功创建用户', async () => {
      // Arrange
      const createUserDto = UserFactory.buildCreateData();
      const expectedUser = UserFactory.build(createUserDto);
      repository.save.mockResolvedValue(expectedUser);

      // Act
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(createUserDto),
      );
    });

    it('当用户名已存在时应该抛出异常', async () => {
      // Arrange
      const createUserDto = UserFactory.buildCreateData();
      repository.findByUsername.mockResolvedValue(UserFactory.build());

      // Act & Assert
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        '用户名已存在',
      );
    });
  });
});
```

### E2E测试规范

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 获取认证token
    const { accessToken } = await TestHelpers.createAuthenticatedUser(app);
    authToken = accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('应该成功创建用户', () => {
      const createUserDto = UserFactory.buildCreateData();

      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveValidStructure();
          expect(res.body.data).toMatchObject({
            username: createUserDto.username,
            email: createUserDto.email,
          });
        });
    });
  });
});
```

## 📋 Git规范

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>(<scope>): <subject>

<body>

<footer>

# 示例
feat(user): 添加用户注册功能

实现用户注册接口，包括：
- 用户名唯一性验证
- 邮箱格式验证
- 密码强度验证

Closes #123
```

### 提交类型

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI/CD配置
- `build`: 构建系统
- `revert`: 回滚

### 分支规范

```bash
# 主分支
main            # 生产环境分支
develop         # 开发环境分支

# 功能分支
feature/user-auth           # 功能开发
feature/payment-system      # 功能开发

# 修复分支
fix/login-issue            # bug修复
hotfix/security-patch      # 紧急修复

# 发布分支
release/v1.0.0             # 版本发布
```

## 💡 最佳实践

### 错误处理

```typescript
// ✅ 推荐：使用自定义异常
@Injectable()
export class UserService {
  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new BusinessException(ERROR_CODES.USER_NOT_FOUND, '用户不存在');
    }

    return user;
  }
}

// ✅ 推荐：全局异常过滤器
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let code: number;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      code = exceptionResponse.code;
      message = exceptionResponse.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 500000;
      message = '服务器内部错误';
    }

    response.status(status).json({
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 日志记录

```typescript
// ✅ 推荐：结构化日志
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`创建用户开始`, {
      username: createUserDto.username,
      email: createUserDto.email,
    });

    try {
      const user = await this.userRepository.save(createUserDto);

      this.logger.log(`创建用户成功`, {
        userId: user.id,
        username: user.username,
      });

      return user;
    } catch (error) {
      this.logger.error(`创建用户失败`, {
        username: createUserDto.username,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }
}
```

### 性能优化

```typescript
// ✅ 推荐：使用缓存
@Injectable()
export class UserService {
  @Cacheable({
    key: 'user:#{id}',
    ttl: 3600, // 1小时
  })
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  @CacheEvict({
    key: 'user:#{id}',
  })
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.getUserById(id);
  }
}

// ✅ 推荐：数据库查询优化
async findUsersWithRoles(pagination: PaginationDto): Promise<[User[], number]> {
  return this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('user.status = :status', { status: UserStatus.ACTIVE })
    .skip((pagination.page - 1) * pagination.pageSize)
    .take(pagination.pageSize)
    .orderBy('user.createdAt', 'DESC')
    .getManyAndCount();
}
```

### 安全最佳实践

```typescript
// ✅ 推荐：输入验证
@Post()
async createUser(@Body() createUserDto: CreateUserDto): Promise<ResponseDto<UserDto>> {
  // DTO自动验证
  return this.userService.createUser(createUserDto);
}

// ✅ 推荐：权限控制
@Post()
@Auth(['admin'])
@RequirePermissions(['user:create'])
async createUser(@Body() createUserDto: CreateUserDto): Promise<ResponseDto<UserDto>> {
  return this.userService.createUser(createUserDto);
}

// ✅ 推荐：敏感信息处理
@Exclude()
password: string;

@Transform(({ value }) => '***')
@ApiHideProperty()
refreshToken: string;
```

## 📖 相关文档

- [快速开始指南](./QUICK_START.md)
- [API文档](./API_DOCUMENTATION.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [配置说明](./CONFIGURATION.md)
- [常见问题](./FAQ.md)

---

**注意**：本规范会随着项目发展持续更新，请定期查看最新版本。

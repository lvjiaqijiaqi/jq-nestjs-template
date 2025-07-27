# ❓ 常见问题解答 (FAQ)

> 本文档收集了NestJS样板工程开发过程中的常见问题和解决方案，帮助开发者快速解决问题。

## 📚 目录

- [环境和安装](#环境和安装)
- [数据库相关](#数据库相关)
- [认证和权限](#认证和权限)
- [缓存和队列](#缓存和队列)
- [测试相关](#测试相关)
- [部署和运维](#部署和运维)
- [开发调试](#开发调试)
- [性能优化](#性能优化)

## 🔧 环境和安装

### Q1: 安装依赖时出现权限错误？

**问题**：运行`npm install`时出现权限相关错误。

**解决方案**：

```bash
# 方法1：使用sudo（不推荐）
sudo npm install

# 方法2：配置npm全局目录（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# 方法3：使用yarn
yarn install
```

### Q2: Node.js版本不兼容？

**问题**：项目要求Node.js 18+，但本地版本较低。

**解决方案**：

```bash
# 使用nvm管理Node.js版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 验证版本
node --version
npm --version
```

### Q3: 项目启动失败，端口被占用？

**问题**：`Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**：

```bash
# 查找占用端口的进程
lsof -ti:3000

# 杀死进程
lsof -ti:3000 | xargs kill -9

# 或者修改端口
export PORT=3001
npm run start:dev
```

## 🗄️ 数据库相关

### Q4: 数据库连接失败？

**问题**：应用启动时数据库连接失败。

**解决方案**：

1. **检查数据库服务状态**：

```bash
# MySQL
sudo systemctl status mysql

# 或使用Docker
docker ps | grep mysql
```

2. **验证连接配置**：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=main
```

3. **测试数据库连接**：

```bash
mysql -h localhost -u root -p -e "SHOW DATABASES;"
```

### Q5: 迁移执行失败？

**问题**：运行`npm run migration:run`时出错。

**解决方案**：

1. **检查迁移状态**：

```bash
npm run migration:show
```

2. **回滚有问题的迁移**：

```bash
npm run migration:revert
```

3. **手动创建数据库**：

```sql
CREATE DATABASE main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **重新执行迁移**：

```bash
npm run migration:run
```

### Q6: 种子数据导入失败？

**问题**：运行`npm run seed:auth`时出错。

**解决方案**：

1. **确保数据库表已创建**：

```bash
npm run migration:run
```

2. **检查种子文件**：

```bash
ls -la src/shared/database/seeds/
```

3. **手动执行种子数据**：

```bash
npm run seed:auth -- --reset
```

## 🔐 认证和权限

### Q7: JWT令牌验证失败？

**问题**：API请求返回401 Unauthorized。

**解决方案**：

1. **检查令牌格式**：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **验证令牌是否过期**：

```bash
# 解码JWT令牌（使用在线工具或库）
node -e "console.log(JSON.parse(Buffer.from('PAYLOAD_PART', 'base64').toString()))"
```

3. **重新获取令牌**：

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Q8: 权限检查失败？

**问题**：用户有相应角色但权限检查失败。

**解决方案**：

1. **检查用户角色**：

```sql
SELECT u.username, r.name as role_name
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.username = 'your_username';
```

2. **检查角色权限**：

```sql
SELECT r.name as role_name, p.name as permission_name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'your_role';
```

3. **重新导入权限数据**：

```bash
npm run seed:auth -- --reset
```

### Q9: 默认管理员账户无法登录？

**问题**：使用默认管理员账户登录失败。

**解决方案**：

1. **检查种子数据是否已导入**：

```sql
SELECT * FROM users WHERE username = 'admin';
```

2. **重新创建管理员账户**：

```bash
npm run seed:auth -- --reset
```

3. **手动创建管理员账户**：

```sql
-- 插入管理员角色（如果不存在）
INSERT INTO roles (id, name, display_name, description, type, level, is_active, is_default, sort)
VALUES (UUID(), 'admin', '管理员', '系统管理员', 'SYSTEM', 999, 1, 0, 1);

-- 插入管理员用户
INSERT INTO users (id, username, email, nickname, password, role_id, status, email_verified)
VALUES (UUID(), 'admin', 'admin@example.com', '管理员', '$2b$10$encrypted_password', 'role_id', 'ACTIVE', 1);
```

## 📊 缓存和队列

### Q10: Redis连接失败？

**问题**：应用启动时Redis连接失败。

**解决方案**：

1. **检查Redis服务状态**：

```bash
# 本地Redis
redis-cli ping

# Docker Redis
docker ps | grep redis
```

2. **启动Redis服务**：

```bash
# 本地启动
redis-server

# Docker启动
docker run -d -p 6379:6379 redis:7-alpine
```

3. **检查Redis配置**：

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Q11: 队列任务不执行？

**问题**：添加到队列的任务一直处于等待状态。

**解决方案**：

1. **检查队列处理器是否启动**：

```bash
# 查看应用日志
docker-compose logs -f app
```

2. **检查Redis队列数据**：

```bash
redis-cli
> KEYS "bull:*"
> LLEN "bull:email:waiting"
```

3. **手动处理队列**：

```bash
# 重启应用
npm run start:dev
```

4. **清理卡住的任务**：

```bash
curl -X DELETE http://localhost:3000/api/queues/email/clean \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🧪 测试相关

### Q12: 测试执行失败？

**问题**：运行`npm run test`时出现错误。

**解决方案**：

1. **检查测试数据库**：

```env
# .env.test
TEST_DB_HOST=localhost
TEST_DB_PORT=3306
TEST_DB_USERNAME=root
TEST_DB_PASSWORD=password
TEST_DB_NAME=test_db
```

2. **创建测试数据库**：

```sql
CREATE DATABASE test_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **清理测试缓存**：

```bash
npm run test:clear
```

4. **单独运行失败的测试**：

```bash
npm run test -- --testNamePattern="YourTestName"
```

### Q13: E2E测试超时？

**问题**：E2E测试执行超时。

**解决方案**：

1. **增加超时时间**：

```javascript
// jest.config.js
module.exports = {
  testTimeout: 60000, // 60秒
};
```

2. **检查测试数据库连接**：

```bash
# 确保测试数据库可访问
mysql -h localhost -u root -p test_db -e "SELECT 1;"
```

3. **并行执行控制**：

```bash
npm run test:e2e -- --maxWorkers=1
```

## 🚀 部署和运维

### Q14: Docker构建失败？

**问题**：Docker镜像构建过程中出错。

**解决方案**：

1. **检查Dockerfile语法**：

```bash
docker build --no-cache -t nestjs-app .
```

2. **清理Docker缓存**：

```bash
docker system prune -f
docker builder prune -f
```

3. **检查.dockerignore文件**：

```bash
# 确保node_modules被忽略
cat .dockerignore | grep node_modules
```

4. **分步构建调试**：

```dockerfile
# 在Dockerfile中添加调试步骤
RUN ls -la /app
RUN npm --version
```

### Q15: 容器启动失败？

**问题**：Docker容器启动后立即退出。

**解决方案**：

1. **查看容器日志**：

```bash
docker logs <container_id>
```

2. **进入容器调试**：

```bash
docker run -it --entrypoint /bin/sh nestjs-app
```

3. **检查健康检查**：

```bash
docker ps -a
docker inspect <container_id> | grep Health
```

### Q16: 环境变量没有生效？

**问题**：容器中的环境变量与预期不符。

**解决方案**：

1. **检查.env文件加载**：

```bash
docker exec -it <container_id> env | grep DB_
```

2. **验证docker-compose配置**：

```yaml
# docker-compose.yml
environment:
  - NODE_ENV=${NODE_ENV:-production}
  - DB_HOST=${DB_HOST}
```

3. **手动传递环境变量**：

```bash
docker run -e NODE_ENV=production -e DB_HOST=mysql nestjs-app
```

## 🐛 开发调试

### Q17: VSCode调试配置？

**问题**：如何在VSCode中调试NestJS应用？

**解决方案**：

创建`.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.ts",
      "args": [],
      "runtimeArgs": [
        "-r",
        "ts-node/register",
        "-r",
        "tsconfig-paths/register"
      ],
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/.env",
      "console": "integratedTerminal"
    }
  ]
}
```

### Q18: 如何查看详细错误信息？

**问题**：生产环境错误信息不够详细。

**解决方案**：

1. **开发环境启用详细日志**：

```env
NODE_ENV=development
LOG_LEVEL=debug
```

2. **查看应用日志**：

```bash
# 本地日志
tail -f logs/app.log

# Docker日志
docker-compose logs -f app
```

3. **启用数据库查询日志**：

```env
DB_LOGGING=true
```

### Q19: API响应缓慢？

**问题**：某些API接口响应时间过长。

**解决方案**：

1. **启用性能监控**：

```bash
curl http://localhost:3000/api/metrics
```

2. **检查数据库慢查询**：

```sql
-- MySQL慢查询日志
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

3. **添加数据库索引**：

```sql
-- 检查查询执行计划
EXPLAIN SELECT * FROM users WHERE email = 'example@example.com';

-- 添加索引
CREATE INDEX idx_users_email ON users(email);
```

4. **启用缓存**：

```typescript
@Cacheable({
  key: 'user:#{id}',
  ttl: 3600,
})
async getUserById(id: string): Promise<User> {
  // 实现
}
```

## ⚡ 性能优化

### Q20: 内存使用过高？

**问题**：应用运行时内存使用率持续上升。

**解决方案**：

1. **监控内存使用**：

```bash
# 容器内存使用
docker stats

# 进程内存使用
htop
```

2. **分析内存泄漏**：

```javascript
// 在开发环境中启用内存监控
process.on('warning', (warning) => {
  console.warn(warning.stack);
});
```

3. **优化数据库查询**：

```typescript
// 使用分页查询
async findUsers(pagination: PaginationDto) {
  return this.userRepository.findAndCount({
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });
}
```

4. **清理未使用的连接**：

```typescript
// 确保数据库连接池配置合理
{
  type: 'mysql',
  poolSize: 10,
  connectionTimeoutMillis: 60000,
  acquireTimeoutMillis: 60000,
  timeout: 60000,
}
```

### Q21: 如何优化启动时间？

**问题**：应用启动时间过长。

**解决方案**：

1. **分析启动时间**：

```bash
time npm run start
```

2. **优化依赖加载**：

```typescript
// 使用动态导入
const module = await import('./heavy-module');
```

3. **延迟初始化**：

```typescript
@Injectable()
export class LazyService {
  @OnApplicationBootstrap()
  onApplicationBootstrap() {
    // 延迟初始化重量级服务
  }
}
```

4. **减少同步操作**：

```typescript
// 并行初始化
await Promise.all([this.initDatabase(), this.initCache(), this.initQueue()]);
```

## 📞 获取更多帮助

如果您遇到的问题不在此FAQ中，可以通过以下方式获取帮助：

1. **查看项目文档**：
   - [开发规范指南](./DEVELOPMENT_GUIDE.md)
   - [快速开始指南](./QUICK_START.md)
   - [API文档说明](./API_DOCUMENTATION.md)

2. **检查日志文件**：
   - 应用日志：`logs/app.log`
   - 错误日志：`logs/error.log`
   - 数据库日志：MySQL slow query log

3. **使用调试工具**：
   - Swagger API文档：http://localhost:3000/api/docs
   - 健康检查：http://localhost:3000/api/health
   - 系统指标：http://localhost:3000/api/metrics

4. **社区支持**：
   - GitHub Issues
   - Stack Overflow
   - NestJS官方文档

---

**注意**：如果您发现了新的常见问题，欢迎提交PR来完善这个FAQ文档。

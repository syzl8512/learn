# API优化检查清单

## 权限控制修复检查

### Book Controller (`backend/src/modules/book/book.controller.ts`)

#### 需要检查的接口：
- [ ] `POST /books/upload` - 应添加 `@Roles('admin', 'content_creator')`
- [ ] `POST /books` - 应添加 `@Roles('admin')`
- [ ] `PATCH /books/:id` - 应添加 `@Roles('admin')`
- [ ] `DELETE /books/:id` - 应添加 `@Roles('admin')`

#### 检查代码示例：
```typescript
@Post('upload')
@UseGuards(JwtAuthGuard, RolesGuard)  // 需要添加RolesGuard
@Roles('admin', 'content_creator')   // 需要添加角色装饰器
@ApiOperation({ summary: '上传书籍 PDF 文件' })
async uploadBook(...) {
  // 现有逻辑
}
```

### Chapter Controller (`backend/src/modules/chapter/chapter.controller.ts`)

#### 需要检查的接口：
- [ ] `POST /chapters` - 应添加 `@Roles('admin')`
- [ ] `PATCH /chapters/:id` - 应添加 `@Roles('admin')`
- [ ] `DELETE /chapters/:id` - 应添加 `@Roles('admin')`

#### 检查代码示例：
```typescript
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)       // 需要添加RolesGuard
@Roles('admin')                 // 需要添加角色装饰器
@Post()
async create(@Body() createChapterDto: CreateChapterDto) {
  // 现有逻辑
}
```

### Lexile Controller (`backend/src/modules/lexile/lexile.controller.ts`)

#### 需要检查的接口：
- [ ] `PATCH /lexile/users/:userId` - 应添加 `@Roles('admin')`

#### 检查代码示例：
```typescript
@Patch('users/:userId')
@UseGuards(JwtAuthGuard, RolesGuard)  // 需要添加
@Roles('admin')                       // 需要添加
@ApiOperation({ summary: '更新用户 Lexile（管理员功能）' })
async updateUserLexile(...) {
  // 现有逻辑
}
```

## 模块整合检查

### Stats模块删除检查
- [ ] `backend/src/modules/stats/` 目录已删除
- [ ] `backend/src/app.module.ts` 中 `StatsModule` 导入已移除
- [ ] `backend/src/app.module.ts` 中 `imports` 数组中 `StatsModule` 已移除

### Analytics模块扩展检查
- [ ] 热力图功能已添加到analytics模块
- [ ] 最近词汇功能已添加到analytics模块
- [ ] 所有stats模块的独有功能已迁移

## 管理员API分离检查

### AdminBookController创建检查
- [ ] `backend/src/modules/book/admin-book.controller.ts` 文件已创建
- [ ] AdminBookController已正确注册到BookModule
- [ ] 所有管理员专用接口已移至AdminBookController

### BookController简化检查
- [ ] BookController中已移除所有创建、更新、删除接口
- [ ] BookController只保留查询和公开接口
- [ ] 前端用户功能不受影响

## API路径结构检查

### 版本控制检查
- [ ] `backend/src/main.ts` 中已设置全局前缀 `api/v1`
- [ ] 所有API路径已更新为 `/api/v1/` 开头

### 路径命名检查
- [ ] 管理员API使用 `/api/v1/admin/` 前缀
- [ ] 用户端API使用 `/api/v1/` 前缀
- [ ] 公开API使用 `/api/v1/public/` 前缀（如果适用）

## 前端API调用更新检查

### 管理后台检查
- [ ] `admin/src/` 中所有API调用路径已更新
- [ ] 书籍管理相关API调用已更新为 `/api/v1/admin/books`
- [ ] 管理员认证API已更新为 `/api/v1/admin/auth`

### 前端用户端检查
- [ ] `frontend/src/` 中所有API调用路径已更新
- [ ] 所有用户端API调用已更新为 `/api/v1/` 前缀
- [ ] 公开接口调用路径正确

## 功能测试检查

### 权限控制测试
- [ ] 普通用户token无法访问管理员接口（返回403）
- [ ] 管理员token可以正常访问管理员接口
- [ ] 未认证用户无法访问需要认证的接口（返回401）
- [ ] 公开接口无需认证即可访问

### 功能完整性测试
- [ ] 用户可以正常浏览书籍列表和详情
- [ ] 用户可以正常管理生词本
- [ ] 用户可以正常保存阅读进度
- [ ] 管理员可以正常管理书籍
- [ ] 管理员可以正常管理章节
- [ ] 数据分析功能正常工作

### 错误处理测试
- [ ] 权限不足时返回清晰的错误信息
- [ ] API路径不存在时返回404
- [ ] 认证失败时返回401
- [ ] 参数错误时返回400

## 文档更新检查

### API文档检查
- [ ] Swagger文档已更新，反映新的API结构
- [ ] 权限要求在文档中清晰标注
- [ ] 接口描述准确反映功能

### 代码注释检查
- [ ] 管理员专用接口有清晰的注释说明
- [ ] 权限控制逻辑有必要的注释
- [ ] API路径变更的影响有记录

## 性能和监控检查

### 日志记录检查
- [ ] 权限验证失败有适当的日志记录
- [ ] 管理员操作有审计日志
- [ ] API访问路径变更不影响现有日志

### 缓存和性能检查
- [ ] API权限验证不影响性能
- [ ] 新的API路径结构不影响缓存策略
- [ ] 前端API调用性能正常

## 部署前最终检查

### 代码质量检查
- [ ] 所有修改已通过linting检查
- [ ] 单元测试已更新并通过
- [ ] 代码结构符合项目规范

### 集成测试检查
- [ ] 前后端集成测试通过
- [ ] 用户流程测试通过
- [ ] 管理员流程测试通过

### 备份和回滚检查
- [ ] 原始代码已备份
- [ ] 数据库备份已完成
- [ ] 回滚方案已准备就绪

---

## 完成确认

当所有检查项都完成后，请确认：

- [ ] 权限控制修复已完成
- [ ] 重复模块已清理
- [ ] API结构已优化
- [ ] 前端调用已更新
- [ ] 功能测试已通过
- [ ] 文档已更新
- [ ] 可以部署到生产环境

**签名**: _________________
**日期**: _________________
**版本**: v1.0
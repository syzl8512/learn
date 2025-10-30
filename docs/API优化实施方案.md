# API优化实施方案

## 概述

基于分析报告，本文档提供具体的代码修改步骤和实施方案，确保前后端职责分离和API结构优化。

## 实施步骤

### 第一步：修复权限控制（最高优先级）

#### 1.1 现有组件检查 ✅
- `RolesGuard` 已存在：`/backend/src/modules/auth/guards/roles.guard.ts`
- `Roles` 装饰器已存在：`/backend/src/modules/auth/decorators/roles.decorator.ts`

#### 1.2 需要修复的API接口

**书籍管理权限修复**：
```typescript
// backend/src/modules/book/book.controller.ts

// 修改前：
@Post('upload')
@UseGuards(JwtAuthGuard)

// 修改后：
@Post('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'content_creator')
```

**章节管理权限修复**：
```typescript
// backend/src/modules/chapter/chapter.controller.ts

// 修改前：
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Post()
async create(@Body() createChapterDto: CreateChapterDto) {

// 修改后：
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
async create(@Body() createChapterDto: CreateChapterDto) {
```

**Lexile管理员功能权限修复**：
```typescript
// backend/src/modules/lexile/lexile.controller.ts

// 修改前：
@Patch('users/:userId')
@ApiOperation({ summary: '更新用户 Lexile（管理员功能）' })

// 修改后：
@Patch('users/:userId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiOperation({ summary: '更新用户 Lexile（管理员功能）' })
```

#### 1.3 具体修复文件列表
1. `/backend/src/modules/book/book.controller.ts` - 4个接口需要添加权限控制
2. `/backend/src/modules/chapter/chapter.controller.ts` - 3个接口需要添加权限控制
3. `/backend/src/modules/lexile/lexile.controller.ts` - 1个接口需要添加权限控制

### 第二步：移除重复的stats模块

#### 2.1 删除重复模块
```bash
# 备份现有代码（可选）
cp -r backend/src/modules/stats backend/src/modules/stats.backup

# 删除stats模块
rm -rf backend/src/modules/stats/
```

#### 2.2 更新模块导入
需要检查并更新以下文件中的stats导入：
- `backend/src/app.module.ts`
- 任何其他引用stats模块的文件

#### 2.3 合并功能到analytics模块
将stats模块中的特色功能迁移到analytics模块：

```typescript
// backend/src/modules/analytics/analytics.controller.ts 添加以下接口：

@Get('heatmap')
@ApiOperation({ summary: '获取学习热力图数据（最近30天）' })
async getHeatmap(@Req() req: AuthenticatedRequest) {
  const userId = req.user.id;
  return this.analyticsService.getHeatmap(userId);
}

@Get('recent-vocabulary')
@ApiOperation({ summary: '获取最近新增词汇（最近7天）' })
async getRecentVocabulary(@Req() req: AuthenticatedRequest) {
  const userId = req.user.id;
  return this.analyticsService.getRecentVocabulary(userId);
}
```

### 第三步：创建管理员专用API路径

#### 3.1 创建AdminBookController
```typescript
// backend/src/modules/book/admin-book.controller.ts

import { Controller, Post, Patch, Delete, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UploadBookDto } from './dto/upload-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('管理员书籍管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/books')
export class AdminBookController {
  private readonly logger = new Logger(AdminBookController.name);

  constructor(private readonly bookService: BookService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传书籍 PDF 文件' })
  async uploadBook(@Body() uploadBookDto: UploadBookDto, file: Express.Multer.File) {
    return this.bookService.uploadBook(uploadBookDto, file);
  }

  @Post()
  @ApiOperation({ summary: '手动创建书籍' })
  async create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新书籍' })
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除书籍' })
  async remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
```

#### 3.2 修改BookController为只读
```typescript
// backend/src/modules/book/book.controller.ts (修改后)

@ApiTags('书籍管理')
@Controller('books')
export class BookController {
  // 只保留公开接口和用户读取接口
  // 移除所有创建、更新、删除接口到AdminBookController
}
```

### 第四步：优化API路径结构

#### 4.1 实施版本控制
```typescript
// backend/src/main.ts 或 创建版本前缀

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置全局前缀
  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
}
```

#### 4.2 统一路径命名规范
```
用户端：
- GET    /api/v1/books              - 书籍列表
- GET    /api/v1/books/{id}         - 书籍详情
- GET    /api/v1/books/{id}/chapters - 书籍章节

管理员端：
- POST   /api/v1/admin/books        - 创建书籍
- PATCH  /api/v1/admin/books/{id}   - 更新书籍
- DELETE /api/v1/admin/books/{id}   - 删除书籍

公开端：
- GET    /api/v1/public/books       - 公开书籍（无需认证）
```

### 第五步：更新前端API调用

#### 5.1 管理后台API路径更新
```typescript
// admin/src/services/api.ts (示例)

// 修改前：
const API_BASE = 'http://localhost:3000/api/books';

// 修改后：
const API_BASE = 'http://localhost:3000/api/v1/admin/books';
```

#### 5.2 前端用户端API路径更新
```typescript
// frontend/src/services/api.ts (示例)

// 修改前：
const API_BASE = 'http://localhost:3000/api/books';

// 修改后：
const API_BASE = 'http://localhost:3000/api/v1/books';
```

## 实施时间表

### 第一天：权限控制修复
- [ ] 修复book.controller.ts中的权限控制
- [ ] 修复chapter.controller.ts中的权限控制
- [ ] 修复lexile.controller.ts中的权限控制
- [ ] 测试权限控制是否正常工作

### 第二天：模块整合
- [ ] 删除stats模块
- [ ] 合并功能到analytics模块
- [ ] 创建AdminBookController
- [ ] 修改BookController为只读

### 第三天：API结构优化
- [ ] 实施API版本控制
- [ ] 统一路径命名规范
- [ ] 更新前端API调用
- [ ] 全面测试

## 测试验证清单

### 权限控制测试
- [ ] 普通用户无法访问管理员接口
- [ ] 管理员可以正常访问管理员接口
- [ ] 公开接口无需认证即可访问

### 功能完整性测试
- [ ] 前端用户功能正常
- [ ] 管理后台功能正常
- [ ] 数据分析功能正常

### API兼容性测试
- [ ] 前端API调用正常
- [ ] 管理后台API调用正常
- [ ] 错误处理和返回格式一致

## 风险控制

### 回滚方案
1. 保留原始代码备份
2. 分步骤实施，每步验证
3. 如有问题，立即回滚

### 测试环境先行
1. 在测试环境完成所有修改
2. 充分测试验证
3. 确认无误后再部署到生产环境

---

**文档创建时间**: 2025-10-30
**预计实施时间**: 3个工作日
**风险等级**: 中等（主要是权限控制修改）
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## 项目概述

**智慧儿童英文辅助阅读平台**是一个 AI 驱动的儿童英文原版阅读难度适配系统。

- **目标用户**: 6-12 岁儿童
- **核心价值**: 使用 AI 将原版英文内容自动难度适配（按蓝斯值/Lexile）
- **当前状态**: 后端服务完整保留，前端和管理后台已清空待重建
- **技术架构**: NestJS 后端 + PostgreSQL + Redis + Docker

## 项目当前状态

### ✅ 已完成
- **NestJS 后端服务**: 完整的 API 服务，包含认证、用户管理、书籍管理、词汇系统等
- **数据库架构**: Prisma + PostgreSQL，包含 16 个数据表
- **AI 服务管道**: PDF 转换、AI 评估、TTS 语音等
- **Docker 环境**: PostgreSQL + Redis 容器化部署

### ❌ 需重建
- **前端应用**: uni-app 框架已配置，但 src 目录已清空
- **管理后台**: React 管理后台目录已完全删除

## 核心技术栈

### 后端（NestJS + Prisma + PostgreSQL）
- **框架**: NestJS 10.x，模块化架构
- **数据库**: PostgreSQL 16（Docker 本地环境）
- **ORM**: Prisma（强类型、迁移管理）
- **认证**: JWT + 微信登录
- **缓存**: Redis + Bull 队列
- **API 文档**: Swagger/OpenAPI（访问 `http://localhost:3000/api-docs`）

### 基础设施
- **Docker**: PostgreSQL + Redis 容器
- **数据库**: 16 个核心数据表
- **AI 服务**: PDF 转换、DeepSeek AI 评估、TTS 语音

## 开发环境设置

### 数据库和基础设施
```bash
# 启动 Docker 容器（PostgreSQL + Redis）
docker-compose up -d

# 停止容器
docker-compose down

# 查看数据库日志
docker-compose logs postgres

# 进入 PostgreSQL 容器
docker exec -it reading-app-postgres psql -U postgres -d reading_app
```

### 后端开发
```bash
cd backend

# 安装依赖
npm install

# Prisma 操作
npm run prisma:generate          # 生成 Prisma Client
npm run prisma:migrate           # 创建新迁移
npm run prisma:studio            # 打开数据库管理界面

# 启动开发服务器
npm run start:dev                # 开发模式（热重载）
npm run start:debug              # 调试模式

# 测试
npm run test                     # 运行所有单元测试
npm run test:watch               # 监听模式
npm run test:cov                 # 生成覆盖率报告
npm run test:e2e                 # E2E 测试

# 运行单个测试文件
npm run test -- auth.service.spec.ts
npm run test:watch -- auth.service.spec.ts

# 代码质量检查
npm run lint                     # ESLint 检查
npm run format                   # Prettier 格式化

# 构建
npm run build
npm run start:prod

# 创建管理员用户
npm run create-admin
```

**访问地址**:
- API 服务: `http://localhost:3000`
- Swagger 文档: `http://localhost:3000/api-docs`
- Prisma Studio: `http://localhost:5555`

### 环境变量配置

#### 后端 (`backend/.env`)
```env
# 应用配置
PORT=3000
API_PREFIX=api
ENABLE_SWAGGER=true

# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/reading_app

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380

# JWT
JWT_SECRET=dev-secret-key-please-change-in-production
JWT_EXPIRES_IN=7d

# 微信小程序
WECHAT_APPID=your-appid
WECHAT_SECRET=your-secret

# AI 服务
DEEPSEEK_API_KEY=your-deepseek-key
MINERU_API_KEY=your-mineru-key

# TTS 服务
ALIYUN_TTS_ACCESS_KEY_ID=your-key
ALIYUN_TTS_ACCESS_KEY_SECRET=your-secret
```

## 后端架构概览

### 核心模块结构
```
backend/src/
├── modules/          # 业务模块
│   ├── auth/        # 认证授权
│   ├── user/        # 用户管理
│   ├── book/        # 书籍管理
│   ├── chapter/     # 章节管理
│   ├── lexile/      # 蓝斯值管理
│   ├── vocabulary/  # 词汇管理
│   ├── progress/    # 进度管理
│   ├── tts/         # TTS 语音
│   ├── wechat/      # 微信服务
│   └── analytics/   # 数据分析
├── ai-pipeline/     # AI 服务管道
│   ├── deepseek/    # DeepSeek AI
│   ├── minerU/      # PDF 转换
│   └── tts/         # TTS 服务
├── common/          # 通用组件
├── config/          # 配置文件
└── main.ts
```

### 数据模型（16个表）

**用户系统**: User、UserCredential、UserLexileHistory
**内容系统**: Book、Chapter、ChapterContent、ExtractedTopic
**听力系统**: ListeningContent、ListeningHistory
**学习系统**: Vocabulary、ReadingProgress、Bookmark
**管理系统**: ImportBatch、AdminLog、SystemConfig

详细字段定义参见: `backend/prisma/schema.prisma`

## 常见开发场景

### 添加新的数据模型
1. 修改 `backend/prisma/schema.prisma`
2. 执行 `cd backend && npm run prisma:migrate -- --name <migration_name>`
3. 自动生成 Prisma Client：`npm run prisma:generate`

### 新增 API 端点
1. 在相应模块中创建 Service（业务逻辑）
2. 在 Controller 中添加路由与参数校验（DTO）
3. 使用 `@UseGuards(JwtAuthGuard)` 标记需认证的路由
4. 通过 Swagger 装饰器（`@ApiOperation`、`@ApiResponse` 等）自动生成文档

### 调试后端服务
```bash
# 方式一：使用命令行调试
cd backend
npm run start:debug
# 然后在 Chrome 打开 chrome://inspect 进行调试

# 方式二：查看日志
tail -f logs/combined.log
tail -f logs/error.log
```

### PDF 转换和 AI 处理
```bash
# PDF 转 Markdown（需要 Python 环境和 MinerU API）
python pdf_to_markdown.py --input path/to/pdf.pdf

# 批量处理书籍
cd backend && npm run prisma:seed  # 导入示例数据
```

## 重要文档

- **需求文档**: `项目需求文档.md` - 核心功能需求和项目概述
- **设计讨论**: `discuss/` - 设计讨论和方案文档
- **API 文档**: 启动后端后访问 `http://localhost:3000/api-docs`
- **任务追踪**: `todo.md` - 当前项目任务清单

## 项目协作规则

### Communication
• 永远使用简体中文进行思考和对话
• 记得在项目根目录下创建了一个 todo 文件，每次在开发之前，你都应该先将我们商量好的代办任务添加到这个文件中
• 每完成一个任务时，记得把对应的任务标记为已完成，这样可以方便我们实时跟踪开发进度

### Documentation
• 编写 .md 文档时，也要用中文
• 正式文档写到项目的 docs/ 目录下
• 用于讨论和评审的计划、方案等文档，写到项目的 discuss/ 目录下

### Code Architecture
• 编写代码的硬性指标：
  （1）对于 Python、JavaScript、TypeScript 等动态语言，尽可能确保每个代码文件不要超过 300 行
  （2）对于 Java、Go、Rust 等静态语言，尽可能确保每个代码文件不要超过 400 行
  （3）每层文件夹中的文件，尽可能不超过 8 个。如有超过，需要规划为多层子文件夹
• 时刻关注优雅的架构设计，避免代码坏味道

### Python
• 数据结构尽可能全部定义成强类型
• Python 虚拟环境永远使用 .venv 作为目录名
• 必须使用 uv，而不是 pip、poetry、conda、python3、python

### uni-app / Vue 3
• 使用 uni-app 3.x 框架，基于 Vue 3
• 状态管理使用 Pinia
• UI 框架使用 uni-ui + 自定义组件
• 支持微信小程序和 H5 双平台

---

**最后更新**: 2025-10-30 (代码库清理后更新)
**项目状态**: 后端完整保留，前端和管理后台待重建
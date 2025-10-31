# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## 项目概述

**智慧儿童英文辅助阅读平台**是一个 AI 驱动的儿童英文原版阅读难度适配系统。

- **目标用户**: 6-12 岁儿童
- **核心价值**: 使用 AI 将原版英文内容自动难度适配（按蓝斯值/Lexile）
- **当前状态**: 后端服务完整保留，前端（Vue 3）和管理后台（React）已重建基础框架
- **技术架构**: NestJS 后端 + PostgreSQL + Redis + Docker + Vue 3 + React

## 项目当前状态

### ✅ 已完成
- **NestJS 后端服务**: 完整的 API 服务，包含认证、用户管理、书籍管理、词汇系统等
- **数据库架构**: Prisma + PostgreSQL，包含 16 个数据表
- **AI 服务管道**: PDF 转换、AI 评估、TTS 语音等
- **Docker 环境**: PostgreSQL + Redis 容器化部署

### 🔄 进行中
- **前端应用**: Vue 3 + TypeScript 基础框架已搭建，包含核心页面和状态管理
- **管理后台**: React + TypeScript 基础框架已搭建，包含管理员登录和布局组件

## 核心技术栈

### 后端（NestJS + Prisma + PostgreSQL）
- **框架**: NestJS 10.x，模块化架构
- **数据库**: PostgreSQL 16（Docker 本地环境）
- **ORM**: Prisma（强类型、迁移管理）
- **认证**: JWT + 微信登录
- **缓存**: Redis + Bull 队列
- **API 文档**: Swagger/OpenAPI（访问 `http://localhost:3000/api-docs`）

### 前端（Vue 3 + TypeScript）
- **框架**: Vue 3.5.x，基于 Composition API
- **状态管理**: Pinia 2.x
- **路由**: Vue Router 4.x
- **构建工具**: Vite 6.x
- **UI 框架**: Element Plus 2.x
- **HTTP 客户端**: Axios 1.x

### 管理后台（React 18 + TypeScript）
- **框架**: React 18.x，函数式组件
- **状态管理**: React Context
- **路由**: React Router 6.x
- **构建工具**: Vite 6.x
- **UI 框架**: Ant Design 5.x
- **HTTP 客户端**: Axios 1.x

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

### 前端开发
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev                     # 开发模式（热重载）
npm run preview                 # 预览构建结果

# 代码质量检查
npm run lint                    # ESLint 检查
npm run type-check              # TypeScript 类型检查

# 构建
npm run build                   # 构建生产版本
```

**访问地址**:
- API 服务: `http://localhost:3000`
- Swagger 文档: `http://localhost:3000/api-docs`
- Prisma Studio: `http://localhost:5555`
- 前端应用: `http://localhost:5173`

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

#### 前端 (`frontend/.env`)
```env
# API 地址
VITE_API_BASE_URL=http://localhost:3000/api

# 应用配置
VITE_APP_TITLE=智慧儿童英文阅读平台
VITE_APP_VERSION=1.0.0
```

## 架构概览

### 前端架构（Vue 3）
```
frontend/src/
├── components/          # 可复用组件
├── views/              # 页面组件
│   ├── HomeView.vue    # 首页
│   ├── ReadingView.vue # 阅读页面
│   ├── ListeningView.vue # 听力页面
│   └── VocabularyView.vue # 生词管理
├── stores/             # Pinia 状态管理
│   ├── user.ts         # 用户状态
│   ├── book.ts         # 书籍状态
│   ├── vocabulary.ts   # 生词状态
│   └── listening.ts    # 听力状态
├── services/           # API 服务层
├── types/              # TypeScript 类型定义
├── router/             # 路由配置
└── styles/             # 样式文件
```

### 管理后台架构（React）
```
admin-dashboard/src/
├── components/         # 可复用组件
├── pages/              # 页面组件
├── services/           # API 服务层
├── hooks/              # 自定义 Hooks
├── utils/              # 工具函数
├── types/              # TypeScript 类型定义
└── styles/             # 样式文件
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

### 前端开发流程
1. **新增页面**: 在 `frontend/src/views/` 创建 Vue 组件
2. **状态管理**: 在 `frontend/src/stores/` 创建 Pinia store
3. **API 服务**: 在 `frontend/src/services/` 添加 API 调用
4. **路由配置**: 在 `frontend/src/router/index.ts` 添加路由
5. **类型定义**: 在 `frontend/src/types/` 添加 TypeScript 类型

### 管理后台开发流程
1. **新增页面**: 在 `admin-dashboard/src/pages/` 创建 React 组件
2. **API 服务**: 在 `admin-dashboard/src/services/` 添加 API 调用
3. **路由配置**: 在路由文件中添加新路由
4. **类型定义**: 在 `admin-dashboard/src/types/` 添加 TypeScript 类型

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

### Vue 3 / TypeScript
• 数据结构尽可能全部定义成强类型
• 优先使用 Composition API 而不是 Options API
• 组件文件保持在 300 行以内
• 使用 Pinia 进行状态管理
• 使用 Element Plus 作为主要 UI 框架

### React / TypeScript
• 数据结构尽可能全部定义成强类型
• 优先使用函数式组件和 Hooks
• 组件文件保持在 400 行以内
• 使用 Ant Design 作为主要 UI 框架
• 使用 React Context 进行全局状态管理

### 通用开发规范
• 所有 API 调用都要有错误处理
• 使用 TypeScript 严格模式
• 保持代码文件简洁，超过行数限制时拆分组件
• 统一使用中文进行注释和文档编写

---

**最后更新**: 2025-10-31 (架构文档优化更新)
**项目状态**: 后端完整保留，前端（Vue 3）和管理后台（React）基础框架已搭建
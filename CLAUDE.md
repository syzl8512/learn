# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**智慧儿童英文辅助阅读平台**（"英语分级阅读"）是一个 AI 驱动的儿童英文原版阅读难度适配系统，包含完整的前后端架构和管理后台。

- **目标用户**: 6-12 岁儿童
- **核心价值**: 使用 AI 将原版英文内容自动难度适配（按蓝斯值/Lexile）
- **技术架构**: NestJS 后端 + uni-app 前端 + React 管理后台 + PostgreSQL + Redis + Docker
- **项目状态**: ✅ 全面完成，系统上线运行（Phase 1-4 所有核心功能已实现）

## 重要规则（极其重要！！！）

### Communication
• 永远使用简体中文进行思考和对话
• 记得在项目根目录下创建了一个 todo 文件，每次在开发之前，你都应该先将我们商量好的代办任务添加到这个文件中
• 每完成一个任务时，记得把对应的任务标记为已完成，这样可以方便我们实时跟踪开发进度
• 合理使用 Task 工具创建多个子代理来提高开发的效率，每个子代理负责一个独立的任务，互不干扰，支持并行开发

### Documentation
• 编写 .md 文档时，也要用中文
• 正式文档写到项目的 docs/ 目录下
• 用于讨论和评审的计划、方案等文档，写到项目的 discuss/ 目录下

### Code Architecture
• 编写代码的硬性指标：
  （1）对于 Python、JavaScript、TypeScript 等动态语言，尽可能确保每个代码文件不要超过 300 行
  （2）对于 Java、Go、Rust 等静态语言，尽可能确保每个代码文件不要超过 400 行
  （3）每层文件夹中的文件，尽可能不超过 8 个。如有超过，需要规划为多层子文件夹
• 时刻关注优雅的架构设计，避免代码坏味道：
  （1）僵化 (Rigidity): 系统难以变更
  （2）冗余 (Redundancy): 代码逻辑重复出现
  （3）循环依赖 (Circular Dependency): 模块互相纠缠
  （4）脆弱性 (Fragility): 修改一处导致其他部分损坏
  （5）晦涩性 (Obscurity): 代码意图不明
  （6）数据泥团 (Data Clump): 数据项总是一起出现
  （7）不必要的复杂性 (Needless Complexity): 过度设计
• 【非常重要！！】一旦识别出代码坏味道，都应当立即询问用户是否需要优化，并给出合理的优化建议

### Run & Debug
• 必须首先在项目的 scripts/ 目录下，维护好 Run & Debug 需要用到的全部 .sh 脚本
• 对于所有 Run & Debug 操作，一律使用 scripts/ 目录下的 .sh 脚本进行启停
• 如果 .sh 脚本执行失败，需要先紧急修复，然后仍然坚持用 .sh 脚本进行启停
• Run & Debug 之前，为所有项目配置 Logger with File Output，并统一输出到 logs/ 目录下

### Python
• 数据结构尽可能全部定义成强类型
• Python 虚拟环境永远使用 .venv 作为目录名
• 必须使用 uv，而不是 pip、poetry、conda、python3、python
• 项目的根目录必须保持简洁，只保留必须存在的文件

### React / Next.js / TypeScript / JavaScript
• Next.js 强制使用 v15.4 版本
• React 强制使用 v19 版本（管理后台当前使用 v18.2.0）
• Tailwind CSS 强制使用 v4
• 严禁使用 commonjs 模块系统
• 尽可能使用 TypeScript
• 数据结构尽可能全部定义成强类型

### uni-app / Vue 3
• 使用 uni-app 3.x 框架，基于 Vue 3
• 状态管理使用 Pinia
• UI 框架使用 uni-ui + 自定义组件
• 支持微信小程序和 H5 双平台

## 核心技术栈

### 后端（NestJS + Prisma + PostgreSQL）
- **框架**: NestJS 10.x，模块化架构
- **数据库**: PostgreSQL 16（Docker 本地环境）
- **ORM**: Prisma（强类型、迁移管理）
- **认证**: JWT + 微信登录
- **缓存**: Redis + Bull 队列
- **API 文档**: Swagger/OpenAPI（访问 `http://localhost:3000/api-docs`）

### 前端（uni-app + Vue 3）
- **框架**: uni-app 3.x，基于 Vue 3
- **状态管理**: Pinia
- **UI 框架**: uni-ui + 自定义组件
- **样式**: SCSS + UnoCSS
- **构建工具**: Vite 5.4
- **平台**: 微信小程序 + H5

### 管理后台（React + TypeScript）
- **框架**: React 18 + TypeScript
- **UI 组件**: Ant Design 5.12
- **状态管理**: Redux Toolkit
- **路由**: React Router 6
- **构建工具**: Create React App
- **代理**: 代理到后端 3000 端口

### AI 与内容管道
- **PDF转换**: MinerU API (Python脚本 `pdf_to_markdown.py`)
- **AI评估**: DeepSeek v3.2 (Lexile评估)
- **TTS服务**: CosyVoice-300M + Kokoro-FastAPI
- **存储**: Synology NAS WebDAV

## 项目结构

```
/Users/zhangliang/Documents/GitHub/learn/
├── backend/                  # NestJS 后端应用
│   ├── src/
│   │   ├── modules/          # 核心业务模块（auth、user、book、chapter等）
│   │   ├── ai-pipeline/     # AI 服务管道
│   │   ├── common/          # 通用组件
│   │   ├── config/          # 配置文件
│   │   └── main.ts
│   ├── prisma/              # Prisma schema 与迁移脚本
│   │   └── schema.prisma   # 数据模型（16个表）
│   ├── .env                 # 环境变量
│   └── package.json
│
├── frontend/                # uni-app 前端应用（Vue 3）
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务层
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── types/          # TypeScript 类型
│   │   └── components/     # 可复用组件
│   └── package.json
│
├── admin/                   # React 管理后台
│   ├── src/                # React 应用源码
│   ├── public/             # 静态资源
│   └── package.json        # 依赖配置
│
├── scripts/                 # 开发和部署脚本
│   ├── dev.sh              # 开发环境启动
│   ├── build.sh            # 构建脚本
│   ├── health-check.sh     # 健康检查
│   ├── clean.sh            # 清理脚本
│   └── db-setup.sh         # 数据库初始化
│
├── *.sh                     # 系统管理脚本
│   ├── start.sh            # 完整系统启动
│   ├── stop.sh             # 系统停止
│   ├── restart.sh          # 系统重启
│   ├── status.sh           # 状态检查
│   └── quick-start.sh      # 快速启动
│
├── docs/                    # 项目文档
├── discuss/                 # 设计讨论文档
├── logs/                    # 日志文件
├── storage/                 # 存储目录
├── docker-compose.yml       # Docker 编排配置
├── pdf_to_markdown.py       # MinerU PDF 转换脚本
└── todo.md                  # 任务追踪清单
```

## 常用命令速查

### 一键启动（推荐）
```bash
# 启动完整开发环境（数据库 + 后端 + 前端）
./scripts/dev.sh

# 完整系统启动（包含管理后台）
./start.sh               # 启动所有服务（数据库 + 后端 + 前端 + 管理后台）

# 健康检查
./scripts/health-check.sh

# 清理和重建
./scripts/clean.sh

# 系统管理
./stop.sh               # 停止所有服务
./restart.sh            # 重启所有服务
./status.sh             # 查看服务状态
./quick-start.sh        # 快速启动（跳过部分检查）
```

### 数据库管理
```bash
# 初始化数据库
./scripts/db-setup.sh

# 启动 Docker 容器（PostgreSQL + Redis）
docker-compose up -d

# 停止容器
docker-compose down

# 查看数据库日志
docker-compose logs postgres

# 进入 PostgreSQL 容器
docker exec -it reading-postgres psql -U postgres -d reading_app
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

### 前端开发
```bash
cd frontend

# 安装依赖
pnpm install

# 启动 H5 开发服务器
pnpm dev:h5

# 启动微信小程序开发
pnpm dev:mp-weixin

# 代码质量检查
pnpm lint                        # ESLint 检查
pnpm type-check                  # TypeScript 类型检查

# 构建
pnpm build:h5
pnpm build:mp-weixin
```

**访问地址**:
- H5 预览: `http://localhost:5173`

### 管理后台开发
```bash
cd admin

# 安装依赖
npm install

# 启动开发服务器（代理到后端 3000 端口）
npm start

# 代码质量检查
npm run lint                      # ESLint 检查
npm run lint:fix                  # ESLint 自动修复
npm run format                    # Prettier 格式化
npm run type-check                # TypeScript 类型检查

# 构建
npm run build
```

**访问地址**:
- 管理后台: `http://localhost:3001` (默认 Create React App 端口)
- API 代理: `http://localhost:3000` (后端服务)

## 核心模块说明

### 后端业务模块（backend/src/modules/）

核心业务模块包括：

1. **auth** - 认证授权
   - JWT 认证 + 微信登录
   - 守卫: `JwtAuthGuard`、`RolesGuard`

2. **user** - 用户管理
   - 用户信息 CRUD
   - 用户统计

3. **book** - 书籍管理
   - 书籍 CRUD、搜索、分页
   - 章节关联

4. **chapter** - 章节管理
   - 章节内容、多版本管理

5. **lexile** - 蓝斯值管理
   - 4档选择、手动输入、AI评估

6. **vocabulary** - 词汇管理
   - 生词本 CRUD、复习、统计

7. **progress** - 进度管理
   - 阅读进度、书签管理

8. **tts** - TTS 语音
   - 文字转语音服务

9. **wechat** - 微信服务
   - 微信登录、code2Session

10. **listening** - 听力模块
    - 听力内容管理
    - 听力历史记录
    - 批量导入功能

### 管理后台功能模块（admin/src/）

1. **仪表板 (Dashboard)** - 系统概览
   - 系统统计数据（书籍数、用户数、浏览量）
   - 阅读趋势图表、用户分布分析
   - 系统监控（CPU、内存、磁盘使用率）

2. **书籍管理 (BookManagement)** - 内容管理核心
   - 书籍 CRUD 操作、PDF 上传与 AI 处理
   - 分册功能、分类管理、批量操作
   - 处理进度监控

3. **听力管理 (ListeningManagement)** - 听力内容
   - 听力内容 CRUD、批量导入（Excel/CSV）
   - 6大话题分类、难度等级设置

4. **用户管理 (UserManagement)** - 用户系统
   - 用户列表、角色权限控制
   - 用户状态管理、蓝斯值等级设置

5. **数据分析 (Analytics)** - 数据洞察
   - 用户增长统计、内容使用分析
   - 学习进度追踪、热门书籍排行

### 前端管理功能（frontend/src/pages/）

1. **个人数据分析** - 学习洞察
   - 个人学习统计、阅读进度趋势
   - 词汇掌握分析、学习建议

2. **听力内容管理** - 个人听力
   - 听力内容查看编辑、播放功能
   - 难度分类筛选、搜索分页

3. **个人中心管理** - 账户设置
   - 个人资料编辑、阅读设置
   - 应用设置、账户管理

### 数据库模型（16个表）

**用户系统**: User、UserCredential、UserLexileHistory
**内容系统**: Book、Chapter、ChapterContent、ExtractedTopic
**听力系统**: ListeningContent、ListeningHistory
**学习系统**: Vocabulary、ReadingProgress、Bookmark
**管理系统**: ImportBatch、AdminLog、SystemConfig

详细字段定义参见: `backend/prisma/schema.prisma`

### ⚠️ 功能重复说明

项目中存在合理的管理功能重复：
- **Admin 后台**: 系统级管理（管理员使用）
- **Frontend 管理**: 个人级管理（学生使用）
- **重叠功能**: 数据分析、内容管理等，但权限和范围不同
- **优化建议**: API 统一化、组件复用、权限细化

## 环境变量配置

### 后端 (`backend/.env`)
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

### 集成新的 AI 提供商
1. 在 `backend/src/ai-pipeline/` 中创建新的 AI 服务目录
2. 实现 Service 类，封装 API 调用逻辑
3. 在环境变量中添加必要的 API Key
4. 在需要的模块中注入和使用新服务

### 调试后端服务
```bash
# 方式一：使用 VSCode 调试
# 在 .vscode/launch.json 中配置调试任务，然后按 F5 启动

# 方式二：使用命令行调试
cd backend
npm run start:debug
# 然后在 Chrome 打开 chrome://inspect 进行调试

# 方式三：查看日志
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

## 关键文件速查

| 文件/目录 | 作用 | 备注 |
|---------|------|------|
| `backend/prisma/schema.prisma` | 数据库模型定义（16表） | 数据建模核心 |
| `backend/src/modules/` | 业务模块 | 核心业务逻辑 |
| `backend/src/ai-pipeline/` | AI 服务管道 | AI 集成相关 |
| `frontend/src/pages/` | 页面组件 | 前端页面 |
| `frontend/src/services/` | API 服务层 | 前端 API 调用 |
| `admin/src/` | React 管理后台 | 系统管理界面 |
| `docker-compose.yml` | Docker 编排配置 | 本地开发环境 |
| `start.sh` | 完整系统启动脚本 | 一键启动所有服务 |
| `scripts/dev.sh` | 开发环境启动脚本 | 一键启动开发环境 |
| `todo.md` | 任务追踪清单 | 进度管理 |
| `scripts/health-check.sh` | 健康检查脚本 | 系统状态检查 |
| `discuss/详细项目设计文档-v2.md` | 完整设计方案 | 架构设计 |

## 重要文档

- **设计方案**: `discuss/详细项目设计文档-v2.md` - 完整的项目设计和架构说明
- **任务追踪**: `todo.md` - 当前迭代任务清单和进度
- **API 文档**: 启动后端后访问 `http://localhost:3000/api-docs`
- **环境配置**: `backend/.env.example` - 环境变量模板
- **紫色主题**: `docs/紫色主题设计规范.md` - 完整的紫色主题设计规范和配色方案

## 主题系统设计

### 紫色主题架构
项目采用完整的紫色主题系统，支持浅色/深色模式：

#### 前端（uni-app）
- **设计系统**: `frontend/src/styles/design-system.scss`
- **UI 系统**: `frontend/src/styles/vue-ui-system.css`（oklch 颜色空间）
- **主色变量**: `--color-primary: #8B5CF6`
- **渐变**: `linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)`

#### 后台管理（React + Ant Design）
- **主题提供器**: `admin/src/components/Theme/ThemeProvider.tsx`
- **设计系统**: `admin/src/styles/design-system.css`
- **Ant Design 配置**: ConfigProvider + oklch 颜色令牌

### 主题切换
- 前端支持通过 CSS 变量动态切换
- 后台支持浅色/深色模式
- 所有组件使用统一的设计令牌

## 项目协作规则

### 任务与进度跟踪
- **单一真实源**: 根目录 `todo.md` 是任务追踪清单
- **子代理标签**: `[FE]`（前端）、`[BE]`（后端）、`[AI]`（AI 适配）、`[管道]`（内容处理）、`[ADMIN]`（管理后台）
- **状态标记**: `[ ]` 待做、`[x]` 完成（附完成日期）

### 代码质量规范
- TypeScript/JavaScript：每个文件 ≤300 行代码
- 模块分层：每层文件 ≤8 个文件
- 禁止违反：循环依赖、代码重复、脆弱的全局状态、不必要的复杂性

## 开发工作流

### 首次开发环境搭建
```bash
# 1. 初始化数据库和基础环境
./scripts/db-setup.sh    # 初始化数据库

# 2. 启动完整系统
./start.sh               # 一键启动所有服务

# 3. 检查系统状态
./scripts/health-check.sh
```

### 日常开发
```bash
# 方式一：使用一键启动脚本（推荐）
./start.sh

# 方式二：分步启动（适合调试）
docker-compose up -d           # 启动数据库
cd backend && npm run start:dev # 启动后端
cd frontend && pnpm dev:h5      # 启动前端 H5
cd admin && npm start          # 启动管理后台
```

### 代码质量检查
```bash
# 后端
cd backend && npm run lint && npm run test:cov

# 前端
cd frontend && pnpm lint && pnpm type-check

# 管理后台
cd admin && npm run lint && npm run type-check
```

## 当前项目状态

- **进度**: Phase 1-4 全部完成 + 紫色主题升级
- **状态**: ✅ 全面完成，系统上线运行
- **总任务数**: 88个（100%完成）
- **完成时间**: 2025-10-28 ~ 2026-02-01
- **最新更新**: 紫色主题全面升级（2025-10-30）

### 项目成果
- **API接口**: 45+ 个
- **前端页面**: 9个
- **测试用例**: 270+ 单元测试 + 50+ E2E场景
- **数据模型**: 16个数据表
- **文档**: 完整的技术文档和配置指南
- **UI主题**: 完整的紫色主题系统（#8B5CF6 主色）

### 最新特性：紫色主题系统
- **主色调**: #8B5CF6（紫色）、#A78BFA（浅紫）、#6D28D9（深紫）
- **前端**: uni-app Vue 3 组件全面应用紫色渐变
- **后台**: React + Ant Design 紫色主题配置
- **设计系统**: 完整的 CSS 变量和 oklch 颜色空间支持

---

**最后更新**: 2025-10-30 (Claude Code 分析更新 - 添加紫色主题系统)
**项目发起**: 2025年10月
**完整架构说明**: 参见 `CLAUDE.md.backup` 和 `discuss/详细项目设计文档-v2.md`
**紫色主题设计**: 参见 `docs/紫色主题设计规范.md`

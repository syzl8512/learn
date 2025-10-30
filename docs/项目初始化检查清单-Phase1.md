# 项目初始化检查清单 - Phase 1

**项目名称**: 英语分级阅读微信小程序
**文档版本**: v1.0
**创建时间**: 2025-10-25
**预计完成时间**: 4-6 小时
**适用阶段**: Phase 1 (基础框架搭建)

---

## 📋 目录

1. [环境要求检查](#环境要求检查)
2. [依赖项安装检查](#依赖项安装检查)
3. [配置项检查清单](#配置项检查清单)
4. [数据库初始化检查](#数据库初始化检查)
5. [启动脚本验证](#启动脚本验证)
6. [第一次启动](#第一次启动)
7. [常见问题解答 FAQ](#常见问题解答-faq)
8. [团队成员分工确认](#团队成员分工确认)
9. [安全检查](#安全检查)
10. [检查清单统计](#检查清单统计)

---

## 环境要求检查

### 1.1 Node.js 版本检查

- [ ] **Node.js 版本 ≥ 18.0.0**
  ```bash
  node -v
  # 期望输出: v18.x.x 或更高
  ```
  - ✅ 如果版本正确,继续
  - ❌ 如果版本过低,请访问 [https://nodejs.org/](https://nodejs.org/) 下载最新 LTS 版本
  - 💡 推荐版本: v20.x.x (LTS)

- [ ] **npm 版本 ≥ 9.0.0**
  ```bash
  npm -v
  # 期望输出: 9.x.x 或更高
  ```

### 1.2 Python 版本检查 (用于 MinerU PDF 处理)

- [ ] **Python 版本 ≥ 3.8**
  ```bash
  python3 --version
  # 期望输出: Python 3.8.x 或更高
  ```
  - ✅ 如果版本正确,继续
  - ❌ 如果未安装或版本过低,请访问 [https://www.python.org/](https://www.python.org/)
  - 💡 推荐版本: Python 3.10 或 3.11

- [ ] **pip 已安装**
  ```bash
  pip3 --version
  # 期望输出: pip 23.x.x 或更高
  ```

### 1.3 Docker 和 Docker Compose 检查

- [ ] **Docker Desktop 已安装**
  ```bash
  docker --version
  # 期望输出: Docker version 24.x.x 或更高
  ```
  - ❌ 如果未安装,请访问 [https://www.docker.com/get-started](https://www.docker.com/get-started)
  - 💡 macOS/Windows 推荐使用 Docker Desktop

- [ ] **Docker Compose 已安装**
  ```bash
  docker compose version
  # 或者 (旧版本)
  docker-compose --version
  # 期望输出: Docker Compose version v2.x.x 或更高
  ```

- [ ] **Docker 服务正在运行**
  ```bash
  docker ps
  # 期望输出: 显示容器列表 (可能为空)
  # 如果报错,请启动 Docker Desktop
  ```

### 1.4 Git 版本检查

- [ ] **Git 已安装**
  ```bash
  git --version
  # 期望输出: git version 2.x.x 或更高
  ```

- [ ] **Git 配置完成**
  ```bash
  git config --global user.name
  git config --global user.email
  # 期望输出: 您的姓名和邮箱
  ```

### 1.5 磁盘空间检查

- [ ] **可用磁盘空间 ≥ 50GB**
  ```bash
  # macOS/Linux
  df -h .

  # Windows
  # 在文件资源管理器中查看
  ```
  - 📊 项目占用空间预估:
    - 代码和依赖: ~2GB
    - Docker 镜像: ~3GB
    - 数据库数据: ~5GB
    - 书籍文件和音频: ~10-30GB
    - 日志和缓存: ~5GB

### 1.6 网络连接检查

- [ ] **互联网连接正常**
  ```bash
  ping -c 3 google.com
  # 或者 (国内)
  ping -c 3 baidu.com
  ```

- [ ] **npm 镜像源配置 (可选,国内推荐)**
  ```bash
  # 查看当前镜像源
  npm config get registry

  # 设置淘宝镜像 (可选)
  npm config set registry https://registry.npmmirror.com
  ```

- [ ] **Docker Hub 连接测试**
  ```bash
  docker pull hello-world
  # 如果下载慢,可配置国内镜像加速器
  ```

---

## 依赖项安装检查

### 2.1 全局 npm 包安装

- [ ] **pm2 (进程管理器,可选)**
  ```bash
  npm install -g pm2
  pm2 --version
  ```

- [ ] **ts-node (TypeScript 执行器)**
  ```bash
  npm install -g ts-node typescript
  ts-node --version
  ```

- [ ] **prisma CLI (数据库工具)**
  ```bash
  npm install -g prisma
  prisma --version
  ```

### 2.2 后端依赖安装

- [ ] **进入后端目录**
  ```bash
  cd /Users/zhangliang/Desktop/英语分级阅读/backend
  ```

- [ ] **安装后端依赖**
  ```bash
  npm install
  # 或者 (如果有 package-lock.json)
  npm ci
  ```

- [ ] **验证依赖安装**
  ```bash
  # 检查关键依赖
  npm list @nestjs/core @nestjs/common @prisma/client
  ```

### 2.3 前端依赖安装 (如果有单独的前端项目)

- [ ] **进入前端目录**
  ```bash
  cd /Users/zhangliang/Desktop/英语分级阅读/frontend
  # 或者小程序目录
  cd /Users/zhangliang/Desktop/英语分级阅读/miniprogram
  ```

- [ ] **安装前端依赖**
  ```bash
  npm install
  ```

### 2.4 Python 依赖安装 (MinerU PDF 处理)

- [ ] **创建 Python 虚拟环境 (推荐)**
  ```bash
  cd /Users/zhangliang/Desktop/英语分级阅读
  python3 -m venv .venv
  source .venv/bin/activate  # macOS/Linux
  # .venv\Scripts\activate  # Windows
  ```

- [ ] **安装 MinerU 相关依赖**
  ```bash
  pip install requests magic-pdf
  # 根据项目实际需求安装其他依赖
  ```

- [ ] **验证 MinerU 依赖**
  ```bash
  python3 -c "import requests; print('requests OK')"
  ```

### 2.5 系统依赖检查

- [ ] **FFmpeg (用于音频处理)**
  ```bash
  ffmpeg -version
  ```
  - ❌ 如果未安装:
    - macOS: `brew install ffmpeg`
    - Ubuntu: `sudo apt install ffmpeg`
    - Windows: 从 [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html) 下载

---

## 配置项检查清单

### 3.1 环境变量配置 (.env 文件)

- [ ] **根目录 .env 文件存在**
  ```bash
  cd /Users/zhangliang/Desktop/英语分级阅读
  ls -la .env
  ```
  - ❌ 如果不存在,从 `.env.example` 复制:
    ```bash
    cp .env.example .env
    ```

- [ ] **后端 .env 文件存在**
  ```bash
  ls -la backend/.env
  ```
  - ❌ 如果不存在:
    ```bash
    cp backend/.env.example backend/.env
    ```

### 3.2 应用基础配置

- [ ] **NODE_ENV 配置正确**
  ```bash
  grep "^NODE_ENV" .env
  # 开发环境: NODE_ENV=development
  # 生产环境: NODE_ENV=production
  ```

- [ ] **PORT 配置正确**
  ```bash
  grep "^PORT" .env
  # 推荐: PORT=3000
  ```

### 3.3 微信小程序配置

- [ ] **微信小程序 AppID 已配置**
  ```bash
  grep "^WECHAT_APP_ID" .env
  # 应该是: WECHAT_APP_ID=wx1234567890abcdef (示例)
  ```
  - 📝 获取地址: [https://mp.weixin.qq.com/](https://mp.weixin.qq.com/)
  - ⚠️ 测试环境可以暂时留空,但正式开发前必须配置

- [ ] **微信小程序 AppSecret 已配置**
  ```bash
  grep "^WECHAT_APP_SECRET" .env
  # 应该是: WECHAT_APP_SECRET=your-secret-here
  ```

### 3.4 DeepSeek API Key 配置 (AI 蓝斯值评估)

- [ ] **DeepSeek API Key 已配置**
  ```bash
  grep "^DEEPSEEK_API_KEY" .env
  # 应该是: DEEPSEEK_API_KEY=sk-xxxxx
  ```
  - 📝 获取地址: [https://platform.deepseek.com/](https://platform.deepseek.com/)
  - 💡 注册账号后在 API Keys 页面生成

- [ ] **DeepSeek API Base URL 配置正确**
  ```bash
  grep "^DEEPSEEK_API_BASE_URL" .env
  # 应该是: DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1
  ```

### 3.5 阿里云 TTS 配置 (音频生成)

- [ ] **阿里云 AccessKey ID 已配置**
  ```bash
  grep "^ALIYUN_ACCESS_KEY_ID" .env
  ```
  - 📝 获取地址: [https://ram.console.aliyun.com/manage/ak](https://ram.console.aliyun.com/manage/ak)

- [ ] **阿里云 AccessKey Secret 已配置**
  ```bash
  grep "^ALIYUN_ACCESS_KEY_SECRET" .env
  ```

- [ ] **阿里云 TTS App Key 已配置**
  ```bash
  grep "^ALIYUN_TTS_APP_KEY" .env
  ```

### 3.6 阿里云 OSS 配置 (文件存储)

- [ ] **OSS Bucket 名称已配置**
  ```bash
  grep "^ALIYUN_OSS_BUCKET" .env
  # 示例: ALIYUN_OSS_BUCKET=english-reading-files
  ```

- [ ] **OSS Region 已配置**
  ```bash
  grep "^ALIYUN_OSS_REGION" .env
  # 示例: ALIYUN_OSS_REGION=oss-cn-shanghai
  ```

### 3.7 数据库配置

- [ ] **PostgreSQL 连接配置正确**
  ```bash
  grep "^DB_" .env
  # DB_HOST=localhost
  # DB_PORT=5432
  # DB_USER=postgres
  # DB_PASSWORD=postgres
  # DB_NAME=english_reading
  ```

- [ ] **DATABASE_URL 格式正确**
  ```bash
  grep "^DATABASE_URL" .env
  # 格式: postgresql://user:password@host:port/database?schema=public
  # 示例: postgresql://postgres:postgres@localhost:5432/english_reading?schema=public
  ```

### 3.8 Redis 配置

- [ ] **Redis 连接配置正确**
  ```bash
  grep "^REDIS_" .env
  # REDIS_HOST=localhost
  # REDIS_PORT=6379
  # REDIS_PASSWORD=redis_password
  # REDIS_DB=0
  ```

### 3.9 JWT 认证配置

- [ ] **JWT_SECRET 已设置 (必须修改默认值!)**
  ```bash
  grep "^JWT_SECRET" .env
  # ⚠️ 生产环境必须使用强随机字符串!
  # 生成随机密钥:
  openssl rand -base64 32
  ```

- [ ] **JWT_EXPIRES_IN 配置合理**
  ```bash
  grep "^JWT_EXPIRES_IN" .env
  # 示例: JWT_EXPIRES_IN=7d (7天)
  ```

### 3.10 MinerU PDF 处理配置

- [ ] **MinerU API 配置完整**
  ```bash
  grep "^MINERU_" .env
  # MINERU_API_BASE_URL=https://api.mineru.com
  # MINERU_API_KEY=your-api-key
  # MINERU_UPLOAD_TIMEOUT=300000
  # MINERU_PROCESSING_TIMEOUT=600000
  ```

---

## 数据库初始化检查

### 4.1 PostgreSQL 启动检查

- [ ] **启动 PostgreSQL 容器**
  ```bash
  cd /Users/zhangliang/Desktop/英语分级阅读
  docker compose up -d postgres
  ```

- [ ] **检查容器运行状态**
  ```bash
  docker ps | grep postgres
  # 应该看到: english-reading-postgres  (状态: Up)
  ```

- [ ] **检查 PostgreSQL 健康状态**
  ```bash
  docker exec english-reading-postgres pg_isready -U postgres -d english_reading
  # 期望输出: english_reading:5432 - accepting connections
  ```

- [ ] **测试数据库连接**
  ```bash
  docker exec -it english-reading-postgres psql -U postgres -d english_reading -c "SELECT version();"
  # 应该显示 PostgreSQL 版本信息
  ```

### 4.2 Redis 启动检查

- [ ] **启动 Redis 容器**
  ```bash
  docker compose up -d redis
  ```

- [ ] **检查容器运行状态**
  ```bash
  docker ps | grep redis
  # 应该看到: english-reading-redis  (状态: Up)
  ```

- [ ] **测试 Redis 连接**
  ```bash
  docker exec english-reading-redis redis-cli -a redis_password ping
  # 期望输出: PONG
  ```

### 4.3 数据库迁移执行

- [ ] **检查 Prisma Schema 文件**
  ```bash
  ls -la backend/prisma/schema.prisma
  # 应该存在
  ```

- [ ] **生成 Prisma Client**
  ```bash
  cd backend
  npx prisma generate
  # 期望输出: ✔ Generated Prisma Client
  ```

- [ ] **执行数据库迁移**
  ```bash
  cd backend
  npx prisma migrate deploy
  # 或者开发环境:
  npx prisma migrate dev --name init
  ```

- [ ] **验证数据库表结构**
  ```bash
  docker exec -it english-reading-postgres psql -U postgres -d english_reading -c "\dt"
  # 应该显示所有创建的表
  ```

### 4.4 初始数据插入 (可选)

- [ ] **检查是否有 seed 脚本**
  ```bash
  ls -la backend/prisma/seed.ts
  ```

- [ ] **运行 seed 脚本**
  ```bash
  cd backend
  npx prisma db seed
  # 或者:
  npm run seed
  ```

- [ ] **验证初始数据**
  ```bash
  docker exec -it english-reading-postgres psql -U postgres -d english_reading -c "SELECT COUNT(*) FROM books;"
  # 应该显示初始化的书籍数量
  ```

---

## 启动脚本验证

### 5.1 脚本文件检查

- [ ] **dev.sh 脚本存在**
  ```bash
  ls -la /Users/zhangliang/Desktop/英语分级阅读/scripts/dev.sh
  ```

- [ ] **db-setup.sh 脚本存在**
  ```bash
  ls -la /Users/zhangliang/Desktop/英语分级阅读/scripts/db-setup.sh
  ```

- [ ] **build.sh 脚本存在**
  ```bash
  ls -la /Users/zhangliang/Desktop/英语分级阅读/scripts/build.sh
  ```

- [ ] **clean.sh 脚本存在**
  ```bash
  ls -la /Users/zhangliang/Desktop/英语分级阅读/scripts/clean.sh
  ```

### 5.2 脚本权限检查

- [ ] **dev.sh 可执行权限**
  ```bash
  chmod +x scripts/dev.sh
  ls -la scripts/dev.sh
  # 权限应该包含 x (可执行)
  ```

- [ ] **db-setup.sh 可执行权限**
  ```bash
  chmod +x scripts/db-setup.sh
  ```

- [ ] **build.sh 可执行权限**
  ```bash
  chmod +x scripts/build.sh
  ```

- [ ] **clean.sh 可执行权限**
  ```bash
  chmod +x scripts/clean.sh
  ```

### 5.3 脚本功能测试

- [ ] **测试 db-setup.sh**
  ```bash
  ./scripts/db-setup.sh
  # 应该能够成功连接数据库并执行迁移
  ```

- [ ] **查看帮助信息**
  ```bash
  ./scripts/dev.sh --help
  # 应该显示使用说明
  ```

---

## 第一次启动

### 6.1 后端服务启动

- [ ] **启动后端开发服务器**
  ```bash
  cd /Users/zhangliang/Desktop/英语分级阅读
  ./scripts/dev.sh --backend-only
  ```

- [ ] **检查后端启动日志**
  ```bash
  tail -f logs/backend.log
  # 期望看到: "Nest application successfully started"
  ```

- [ ] **检查后端服务端口监听**
  ```bash
  lsof -i :3000
  # 或者
  netstat -an | grep 3000
  # 应该看到端口 3000 被监听
  ```

- [ ] **访问后端健康检查接口**
  ```bash
  curl http://localhost:3000/health
  # 期望输出: {"status":"ok"}
  ```

### 6.2 Swagger 文档访问

- [ ] **访问 Swagger 文档页面**
  ```bash
  # 在浏览器中打开:
  open http://localhost:3000/api-docs
  ```
  - ✅ 应该看到完整的 API 文档界面
  - 📋 检查以下 API 模块是否存在:
    - [ ] Auth (认证模块)
    - [ ] Users (用户模块)
    - [ ] Books (书籍模块)
    - [ ] Chapters (章节模块)
    - [ ] Vocabulary (词汇模块)

### 6.3 前端服务启动 (如果有)

- [ ] **启动前端开发服务器**
  ```bash
  ./scripts/dev.sh --frontend-only
  ```

- [ ] **检查前端启动日志**
  ```bash
  tail -f logs/frontend.log
  # 期望看到编译成功信息
  ```

- [ ] **访问前端应用**
  ```bash
  # 在浏览器中打开:
  open http://localhost:3001
  ```

### 6.4 完整启动测试

- [ ] **同时启动后端和前端**
  ```bash
  ./scripts/dev.sh
  ```

- [ ] **验证所有服务正常运行**
  ```bash
  # 后端 API
  curl http://localhost:3000/health

  # 前端页面
  curl -I http://localhost:3001
  # 应该返回 200 OK
  ```

---

## 常见问题解答 (FAQ)

### 7.1 Docker 启动失败

**问题**: Docker 容器无法启动

**解决方案**:

1. **检查 Docker Desktop 是否运行**
   ```bash
   docker info
   # 如果报错,启动 Docker Desktop
   ```

2. **检查端口是否被占用**
   ```bash
   # PostgreSQL 端口
   lsof -i :5432
   # Redis 端口
   lsof -i :6379

   # 如果端口被占用,停止占用进程或修改 docker-compose.yml 端口配置
   ```

3. **查看容器日志**
   ```bash
   docker logs english-reading-postgres
   docker logs english-reading-redis
   ```

4. **重新创建容器**
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### 7.2 数据库连接失败

**问题**: 后端无法连接到 PostgreSQL

**解决方案**:

1. **检查数据库是否启动**
   ```bash
   docker ps | grep postgres
   ```

2. **检查 DATABASE_URL 配置**
   ```bash
   grep "^DATABASE_URL" .env
   # 确保格式正确: postgresql://user:password@host:port/database
   ```

3. **测试数据库连接**
   ```bash
   docker exec -it english-reading-postgres psql -U postgres -d english_reading
   ```

4. **检查防火墙设置**
   ```bash
   # macOS 可能需要允许 Docker 网络访问
   ```

### 7.3 npm 依赖冲突

**问题**: npm install 时出现依赖冲突

**解决方案**:

1. **清除缓存**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **使用 --legacy-peer-deps**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **升级 npm 版本**
   ```bash
   npm install -g npm@latest
   ```

4. **检查 Node.js 版本兼容性**
   ```bash
   node -v
   # 确保版本 ≥ 18
   ```

### 7.4 微信登录本地测试

**问题**: 微信小程序登录在本地无法测试

**解决方案**:

1. **使用微信开发者工具**
   - 下载: [https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
   - 配置本地后端地址

2. **配置测试 AppID**
   - 使用微信测试号: [https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)

3. **Mock 微信登录 (开发环境)**
   ```typescript
   // 在后端添加测试接口
   @Post('auth/test-login')
   async testLogin() {
     // 返回模拟 token
     return { token: 'test-token-123' };
   }
   ```

### 7.5 MinerU PDF 处理失败

**问题**: PDF 上传后无法转换为 Markdown

**解决方案**:

1. **检查 MinerU API 配置**
   ```bash
   grep "^MINERU_" .env
   # 确保 API Key 正确
   ```

2. **测试 MinerU API 连接**
   ```bash
   curl -X GET https://api.mineru.com/health
   # 或者根据实际 API 地址
   ```

3. **检查 Python 依赖**
   ```bash
   python3 -c "import requests; print('OK')"
   ```

4. **查看处理日志**
   ```bash
   tail -f logs/pdf-processing.log
   ```

5. **检查文件大小限制**
   ```bash
   grep "^MAX_FILE_SIZE" .env
   # 默认: 52428800 (50MB)
   ```

### 7.6 端口冲突

**问题**: 端口 3000 或 3001 已被占用

**解决方案**:

1. **查找占用进程**
   ```bash
   lsof -i :3000
   lsof -i :3001
   ```

2. **停止占用进程**
   ```bash
   kill <PID>
   ```

3. **修改端口配置**
   ```bash
   # 编辑 .env 文件
   PORT=4000
   FRONTEND_PORT=4001
   ```

### 7.7 Prisma 迁移失败

**问题**: prisma migrate 报错

**解决方案**:

1. **使用 db push (开发环境)**
   ```bash
   cd backend
   npx prisma db push
   ```

2. **重置数据库 (谨慎!)**
   ```bash
   npx prisma migrate reset
   ```

3. **手动创建迁移**
   ```bash
   npx prisma migrate dev --create-only
   # 然后编辑生成的 SQL 文件
   npx prisma migrate dev
   ```

---

## 团队成员分工确认

### 8.1 后端团队

- [ ] **后端负责人已确认**
  - 姓名: _______________
  - 负责模块: 架构设计、Code Review
  - 联系方式: _______________

- [ ] **BE-1: 认证模块负责人**
  - 姓名: _______________
  - 负责: JWT、微信登录、用户管理

- [ ] **BE-2: 书籍模块负责人**
  - 姓名: _______________
  - 负责: 书籍、章节、CRUD API

- [ ] **BE-3: 词汇模块负责人**
  - 姓名: _______________
  - 负责: 词汇查询、生词本、学习进度

### 8.2 前端团队

- [ ] **前端负责人已确认**
  - 姓名: _______________
  - 负责模块: UI 设计、组件库、性能优化
  - 联系方式: _______________

- [ ] **FE-1: 小程序框架负责人**
  - 姓名: _______________
  - 负责: 页面路由、全局状态

- [ ] **FE-2: 登录和蓝斯值选择**
  - 姓名: _______________
  - 负责: 登录页、蓝斯值选择器

- [ ] **FE-3: 阅读和词汇页面**
  - 姓名: _______________
  - 负责: 阅读页、生词本、学习仪表板

### 8.3 AI/Pipeline 团队

- [ ] **AI/Pipeline 负责人已确认**
  - 姓名: _______________
  - 负责: MinerU 集成、AI 服务、数据流
  - 联系方式: _______________

- [ ] **AI-1: MinerU 集成负责人**
  - 姓名: _______________
  - 负责: PDF 处理、章节分割

- [ ] **AI-2: AI 服务集成负责人**
  - 姓名: _______________
  - 负责: DeepSeek、TTS、蓝斯值评估

### 8.4 DevOps 团队

- [ ] **DevOps 负责人已确认**
  - 姓名: _______________
  - 负责: 环境配置、CI/CD、监控
  - 联系方式: _______________

### 8.5 QA 团队

- [ ] **QA 负责人已确认**
  - 姓名: _______________
  - 负责: 测试计划、缺陷追踪
  - 联系方式: _______________

- [ ] **QA-1: 功能测试**
  - 姓名: _______________

- [ ] **QA-2: 性能测试**
  - 姓名: _______________

---

## 安全检查

### 9.1 敏感文件保护

- [ ] **.env 文件不在版本控制中**
  ```bash
  git status .env
  # 应该显示: Untracked files 或不显示

  # 检查 .gitignore
  grep "^\.env$" .gitignore
  # 应该存在这一行
  ```

- [ ] **.env.example 不包含真实密钥**
  ```bash
  grep -E "(API_KEY|SECRET|PASSWORD)" .env.example
  # 所有值应该是占位符,如: your-api-key-here
  ```

- [ ] **logs/ 目录不在版本控制中**
  ```bash
  grep "^logs/" .gitignore
  ```

- [ ] **node_modules/ 不在版本控制中**
  ```bash
  grep "^node_modules/" .gitignore
  ```

### 9.2 密钥和 API Key 安全

- [ ] **JWT_SECRET 已修改 (不是默认值)**
  ```bash
  grep "^JWT_SECRET" .env
  # ⚠️ 绝对不能是: your-super-secret-jwt-key-change-in-production
  ```

- [ ] **COOKIE_SECRET 已修改**
  ```bash
  grep "^COOKIE_SECRET" .env
  ```

- [ ] **数据库密码强度检查**
  ```bash
  grep "^DB_PASSWORD" .env
  # ⚠️ 生产环境必须使用强密码 (>= 12位,包含大小写字母、数字、特殊字符)
  ```

- [ ] **Redis 密码已设置**
  ```bash
  grep "^REDIS_PASSWORD" .env
  # ⚠️ 不能留空
  ```

### 9.3 API Key 有效性验证

- [ ] **DeepSeek API Key 有效**
  ```bash
  # 使用 curl 测试
  curl -X POST https://api.deepseek.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
    -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"test"}]}'
  # 应该返回正常响应,不报错 401
  ```

- [ ] **阿里云 AccessKey 有效**
  ```bash
  # 可以通过阿里云控制台验证
  ```

### 9.4 数据库安全

- [ ] **数据库端口不对外暴露 (生产环境)**
  ```bash
  # 检查 docker-compose.yml
  grep -A 2 "postgres:" docker-compose.yml | grep ports
  # 生产环境应该注释掉 ports 配置,只允许内部网络访问
  ```

- [ ] **数据库备份策略已制定**
  - [ ] 自动备份脚本已配置
  - [ ] 备份存储位置已确定
  - [ ] 备份恢复流程已测试

### 9.5 HTTPS 和 SSL (生产环境)

- [ ] **生产环境已配置 HTTPS**
  - [ ] SSL 证书已申请 (Let's Encrypt 或其他)
  - [ ] Nginx/Caddy 配置完成
  - [ ] HTTPS 跳转已启用

- [ ] **COOKIE_SECURE 配置正确**
  ```bash
  grep "^COOKIE_SECURE" .env
  # 开发环境: COOKIE_SECURE=false
  # 生产环境: COOKIE_SECURE=true
  ```

---

## 检查清单统计

### 总体统计

| 类别 | 检查项数量 | 估计时间 |
|------|-----------|---------|
| **环境要求检查** | 18 项 | 30 分钟 |
| **依赖项安装检查** | 15 项 | 45 分钟 |
| **配置项检查清单** | 28 项 | 60 分钟 |
| **数据库初始化检查** | 12 项 | 30 分钟 |
| **启动脚本验证** | 10 项 | 20 分钟 |
| **第一次启动** | 12 项 | 30 分钟 |
| **团队成员分工确认** | 12 项 | 20 分钟 |
| **安全检查** | 15 项 | 40 分钟 |
| **总计** | **122 项** | **4-6 小时** |

### 优先级划分

| 优先级 | 描述 | 项目数 |
|--------|------|--------|
| **P0 (必须)** | 不完成无法启动项目 | 85 项 |
| **P1 (重要)** | 应该完成,影响开发效率 | 25 项 |
| **P2 (可选)** | 可以稍后完成 | 12 项 |

### 完成进度跟踪

```
总进度: [ ] 0/122 (0%)

环境检查:      [ ] 0/18
依赖安装:      [ ] 0/15
配置检查:      [ ] 0/28
数据库初始化:  [ ] 0/12
脚本验证:      [ ] 0/10
首次启动:      [ ] 0/12
团队分工:      [ ] 0/12
安全检查:      [ ] 0/15
```

---

## 下一步行动

完成本检查清单后,您可以:

1. **进入 Week 1 开发**: 参考 `PHASE1-DEVELOPMENT-PLAN.md`
2. **运行 todo.md 跟踪**: 使用 `todo.md` 文件跟踪每日任务
3. **团队 Kick-off 会议**: 组织团队启动会议
4. **开始编码**: 按照分工开始实际开发

---

## 附录: 快速命令参考

### 一键启动 (推荐)

```bash
# 完整启动 (首次使用)
./scripts/dev.sh

# 跳过 Docker (容器已运行)
./scripts/dev.sh --skip-docker

# 仅后端
./scripts/dev.sh --backend-only

# 仅前端
./scripts/dev.sh --frontend-only
```

### 数据库管理

```bash
# 初始化数据库
./scripts/db-setup.sh

# 查看数据库
cd backend && npx prisma studio

# 重置数据库 (谨慎!)
cd backend && npx prisma migrate reset
```

### Docker 管理

```bash
# 启动所有容器
docker compose up -d

# 查看容器状态
docker ps

# 查看日志
docker logs english-reading-postgres
docker logs english-reading-redis

# 停止并删除容器
docker compose down

# 停止并删除容器+数据卷
docker compose down -v
```

### 日志查看

```bash
# 后端日志
tail -f logs/backend.log

# 前端日志
tail -f logs/frontend.log

# PostgreSQL 日志
tail -f logs/postgres/postgresql.log

# Redis 日志
tail -f logs/redis/redis.log
```

---

**文档版本**: v1.0
**最后更新**: 2025-10-25
**维护者**: Claude Code

**祝您项目顺利启动!** 🚀

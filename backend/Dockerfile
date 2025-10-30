# ========================================
# 英语分级阅读项目 - 后端 Dockerfile (多阶段构建)
# ========================================
# 基于 Node.js 20 Alpine 镜像,减小镜像大小
# 使用多阶段构建,分离构建和运行环境

# ========================================
# Stage 1: 依赖安装阶段
# ========================================
FROM node:20-alpine AS dependencies

# 设置工作目录
WORKDIR /app

# 安装 pnpm (更快的包管理器)
RUN npm install -g pnpm

# 仅复制 package.json 和 lock 文件 (利用 Docker 缓存)
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# 安装所有依赖 (包括 devDependencies,因为需要构建)
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm install; \
    fi

# ========================================
# Stage 2: 构建阶段
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# 从依赖阶段复制 node_modules
COPY --from=dependencies /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建 TypeScript 项目
RUN npm run build

# 清理开发依赖,仅保留生产依赖
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --prod --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci --only=production; \
    elif [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
    else npm install --only=production; \
    fi

# ========================================
# Stage 3: 生产运行阶段 (最小化镜像)
# ========================================
FROM node:20-alpine AS runner

# 安装必要的系统依赖
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production
ENV PORT=3000

# 从构建阶段复制生产依赖
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# 从构建阶段复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# 复制 Prisma schema (用于运行时迁移)
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# 复制 package.json (用于运行时信息)
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# 创建日志目录
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# 使用 dumb-init 作为 PID 1,处理信号
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["node", "dist/main.js"]

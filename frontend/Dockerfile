# ========================================
# 英语分级阅读项目 - 前端 Dockerfile (uni-app 小程序构建)
# ========================================
# 注意: 小程序通常不需要 Docker 部署,此文件仅用于构建小程序代码

# ========================================
# Stage 1: 依赖安装
# ========================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# 安装依赖
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm install; \
    fi

# ========================================
# Stage 2: 构建小程序
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# 从依赖阶段复制 node_modules
COPY --from=dependencies /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 构建小程序 (微信小程序)
RUN npm run build:mp-weixin

# ========================================
# Stage 3: 导出构建产物
# ========================================
FROM scratch AS exporter

# 从构建阶段复制构建产物
COPY --from=builder /app/dist/build/mp-weixin /mp-weixin

# 注意: 此镜像仅用于导出构建产物,不运行任何服务
# 使用方式: docker build --target=exporter --output=./output .

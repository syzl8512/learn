#!/bin/bash

# 管理后台一键启动脚本
# 用于启动完整的开发环境：Docker + 后端 + 前端

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本所在目录（项目根目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ADMIN_DIR="$SCRIPT_DIR/admin"
BACKEND_DIR="$SCRIPT_DIR/backend"
DOCKER_COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# 后台进程 PID
BACKEND_PID=""

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}  管理后台一键启动脚本${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查 Node.js 版本
check_node_version() {
    print_info "检查 Node.js 版本..."
    
    if ! command_exists node; then
        print_error "Node.js 未安装"
        print_info "请访问 https://nodejs.org/ 安装 Node.js 18 或更高版本"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
    
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_error "Node.js 版本过低: v$NODE_VERSION"
        print_info "需要 Node.js 18 或更高版本"
        exit 1
    fi
    
    print_success "Node.js 版本: v$NODE_VERSION"
}

# 检查 Docker
check_docker() {
    print_info "检查 Docker..."
    
    if ! command_exists docker; then
        print_error "Docker 未安装"
        print_info "请访问 https://www.docker.com/ 安装 Docker Desktop"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker 未运行"
        print_info "请启动 Docker Desktop"
        exit 1
    fi
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose 未安装"
        exit 1
    fi
    
    print_success "Docker 已安装并运行"
}

# 检查并启动 Docker 容器
start_docker() {
    print_info "检查 Docker 容器状态..."
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        print_error "找不到 docker-compose.yml 文件: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    # 检查容器是否已经在运行
    if docker compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        print_success "Docker 容器已在运行"
        return 0
    fi
    
    print_info "启动 Docker 容器 (PostgreSQL + Redis)..."
    docker compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    if [ $? -eq 0 ]; then
        print_success "Docker 容器启动成功"
    else
        print_error "Docker 容器启动失败"
        exit 1
    fi
    
    # 等待数据库就绪
    print_info "等待数据库就绪..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec reading-app-postgres pg_isready -U postgres >/dev/null 2>&1; then
            print_success "数据库已就绪"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    
    echo
    print_warning "数据库就绪超时，但继续启动..."
}

# 检查包管理器
check_package_manager() {
    print_info "检查包管理器..."
    
    # 前端使用 pnpm
    if command_exists pnpm; then
        PNPM_VERSION=$(pnpm -v)
        print_success "pnpm 版本: v$PNPM_VERSION"
        FRONTEND_PACKAGE_MANAGER="pnpm"
    else
        print_warning "pnpm 未安装，使用 npm 代替"
        if ! command_exists npm; then
            print_error "npm 未安装"
            exit 1
        fi
        FRONTEND_PACKAGE_MANAGER="npm"
    fi
    
    # 后端使用 npm
    if ! command_exists npm; then
        print_error "npm 未安装（后端需要）"
        exit 1
    fi
    NPM_VERSION=$(npm -v)
    print_success "npm 版本: v$NPM_VERSION"
}

# 检查并安装后端依赖
check_backend_dependencies() {
    print_info "检查后端依赖..."
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "找不到 backend 目录: $BACKEND_DIR"
        exit 1
    fi
    
    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        print_warning "后端依赖未安装，正在安装..."
        cd "$BACKEND_DIR"
        npm install
        
        if [ $? -eq 0 ]; then
            print_success "后端依赖安装完成"
        else
            print_error "后端依赖安装失败"
            exit 1
        fi
        cd - >/dev/null
    else
        print_success "后端依赖已安装"
    fi
}

# 检查并安装前端依赖
check_frontend_dependencies() {
    print_info "检查前端依赖..."
    
    if [ ! -d "$ADMIN_DIR" ]; then
        print_error "找不到 admin 目录: $ADMIN_DIR"
        exit 1
    fi
    
    if [ ! -d "$ADMIN_DIR/node_modules" ]; then
        print_warning "前端依赖未安装，正在安装..."
        cd "$ADMIN_DIR"
        $FRONTEND_PACKAGE_MANAGER install
        
        if [ $? -eq 0 ]; then
            print_success "前端依赖安装完成"
        else
            print_error "前端依赖安装失败"
            exit 1
        fi
        cd - >/dev/null
    else
        print_success "前端依赖已安装"
    fi
}

# 检查端口是否被占用
check_port_available() {
    local port=$1
    local service_name=$2
    
    if lsof -i :$port >/dev/null 2>&1; then
        print_warning "$service_name 端口 $port 已被占用"
        
        # 询问是否继续
        read -p "是否继续启动? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 启动后端服务
start_backend() {
    print_info "启动后端服务..."
    
    cd "$BACKEND_DIR"
    
    # 检查后端环境变量
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        print_warning "后端 .env 文件不存在，使用默认配置"
    fi
    
    # 在后台启动后端服务
    npm run start:dev > "$SCRIPT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    print_success "后端服务已启动 (PID: $BACKEND_PID)"
    print_info "后端日志: $SCRIPT_DIR/backend.log"
    
    # 等待后端服务就绪
    print_info "等待后端服务就绪..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:3000/api/health >/dev/null 2>&1; then
            print_success "后端服务已就绪"
            cd - >/dev/null
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    
    echo
    print_warning "后端服务启动超时，但继续启动前端..."
    cd - >/dev/null
}

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}正在停止服务...${NC}"
    
    # 停止后端服务
    if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        print_info "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        wait $BACKEND_PID 2>/dev/null || true
    fi
    
    # 询问是否停止 Docker 容器
    read -p "是否停止 Docker 容器? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "停止 Docker 容器..."
        docker compose -f "$DOCKER_COMPOSE_FILE" down
        print_success "Docker 容器已停止"
    else
        print_info "Docker 容器将继续运行"
    fi
    
    print_success "服务已停止"
    exit 0
}

# 显示启动信息
show_startup_info() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  启动成功！${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  - 管理后台: ${GREEN}http://localhost:3001${NC}"
    echo -e "  - 后端 API: ${GREEN}http://localhost:3000/api${NC}"
    echo -e "  - API 文档: ${GREEN}http://localhost:3000/api-docs${NC}"
    echo -e "  - 数据库: ${BLUE}PostgreSQL localhost:5434${NC}"
    echo -e "  - 缓存: ${BLUE}Redis localhost:6380${NC}\n"
    
    echo -e "${BLUE}提示:${NC}"
    echo -e "  - 按 ${YELLOW}Ctrl+C${NC} 停止所有服务"
    echo -e "  - 修改代码后会自动热重载"
    echo -e "  - 后端日志: ${YELLOW}$SCRIPT_DIR/backend.log${NC}"
    echo -e "  - 管理员账号: admin / admin123 (默认)\n"
}

# 主函数
main() {
    # 设置清理函数
    trap cleanup INT TERM
    
    # 检查命令行参数
    SKIP_DOCKER=false
    SKIP_BACKEND=false
    CLEAN_CACHE=false
    
    for arg in "$@"; do
        case $arg in
            --skip-docker)
                SKIP_DOCKER=true
                ;;
            --skip-backend)
                SKIP_BACKEND=true
                ;;
            --clean|-c)
                CLEAN_CACHE=true
                ;;
            --help|-h)
                echo "用法: $0 [选项]"
                echo ""
                echo "选项:"
                echo "  --skip-docker     跳过 Docker 启动（假设容器已运行）"
                echo "  --skip-backend    跳过后端启动（仅启动前端）"
                echo "  --clean, -c       启动前清理缓存"
                echo "  --help, -h        显示帮助信息"
                echo ""
                echo "示例:"
                echo "  $0                # 完整启动（Docker + 后端 + 前端）"
                echo "  $0 --skip-backend # 仅启动前端（Docker 和后端已运行）"
                exit 0
                ;;
            *)
                print_warning "未知参数: $arg"
                ;;
        esac
    done
    
    print_header
    
    # 执行检查
    check_node_version
    check_package_manager
    
    # Docker 相关
    if [ "$SKIP_DOCKER" = false ]; then
        check_docker
        start_docker
    else
        print_info "跳过 Docker 启动（假设容器已运行）"
    fi
    
    # 后端相关
    if [ "$SKIP_BACKEND" = false ]; then
        check_backend_dependencies
        check_port_available 3000 "后端服务"
        start_backend
    else
        print_info "跳过后端启动（仅启动前端）"
    fi
    
    # 前端相关
    check_frontend_dependencies
    check_port_available 3001 "管理后台"
    
    # 清理缓存（如果需要）
    if [ "$CLEAN_CACHE" = true ]; then
        print_info "清理前端缓存..."
        cd "$ADMIN_DIR"
        if [ -d "node_modules/.vite" ]; then
            rm -rf node_modules/.vite
            print_success "已清理 Vite 缓存"
        fi
        cd - >/dev/null
    fi
    
    # 显示启动信息
    show_startup_info
    
    # 切换到前端目录并启动
    cd "$ADMIN_DIR"
    print_info "启动前端开发服务器...\n"
    $FRONTEND_PACKAGE_MANAGER run dev
}

# 运行主函数
main "$@"

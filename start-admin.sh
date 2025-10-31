#!/bin/bash

# 管理后台启动脚本
# 用于快速启动 React 管理后台开发服务器

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
    echo -e "${BLUE}  管理后台启动脚本${NC}"
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

# 检查 pnpm 是否安装
check_pnpm() {
    print_info "检查 pnpm 是否安装..."
    
    if ! command_exists pnpm; then
        print_warning "pnpm 未安装，正在安装..."
        npm install -g pnpm
        
        if [ $? -eq 0 ]; then
            print_success "pnpm 安装成功"
        else
            print_error "pnpm 安装失败"
            print_info "您可以手动安装: npm install -g pnpm"
            exit 1
        fi
    else
        PNPM_VERSION=$(pnpm -v)
        print_success "pnpm 版本: $PNPM_VERSION"
    fi
}

# 检查并安装依赖
check_dependencies() {
    print_info "检查依赖是否安装..."
    
    if [ ! -d "$ADMIN_DIR/node_modules" ]; then
        print_warning "依赖未安装，正在安装..."
        cd "$ADMIN_DIR"
        pnpm install
        
        if [ $? -eq 0 ]; then
            print_success "依赖安装完成"
        else
            print_error "依赖安装失败"
            exit 1
        fi
    else
        print_success "依赖已安装"
    fi
}

# 显示启动信息
show_startup_info() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  启动成功！${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  - 管理后台: ${GREEN}http://localhost:3001${NC}"
    echo -e "  - 后端 API: ${YELLOW}http://localhost:3000/api${NC} (需要后端服务运行)\n"
    echo -e "${BLUE}提示:${NC}"
    echo -e "  - 按 ${YELLOW}Ctrl+C${NC} 停止服务"
    echo -e "  - 如果后端未运行，API 调用可能会失败"
    echo -e "  - 修改代码后会自动热重载\n"
}

# 主函数
main() {
    print_header
    
    # 检查目录是否存在
    if [ ! -d "$ADMIN_DIR" ]; then
        print_error "找不到 admin 目录: $ADMIN_DIR"
        exit 1
    fi
    
    # 执行检查
    check_node_version
    check_pnpm
    check_dependencies
    
    # 切换到 admin 目录
    cd "$ADMIN_DIR"
    
    # 显示启动信息
    show_startup_info
    
    # 启动开发服务器
    print_info "启动开发服务器...\n"
    pnpm dev
}

# 捕获中断信号，优雅退出
trap 'echo -e "\n${YELLOW}正在停止服务...${NC}"; exit 0' INT TERM

# 运行主函数
main


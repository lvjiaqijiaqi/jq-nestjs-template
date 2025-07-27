#!/bin/bash

# 环境设置脚本
# 帮助快速配置不同环境的配置文件

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "环境设置脚本"
    echo ""
    echo "用法: ./scripts/env-setup.sh [环境] [选项]"
    echo ""
    echo "环境:"
    echo "  dev           设置开发环境"
    echo "  staging       设置预发布环境"
    echo "  prod          设置生产环境"
    echo ""
    echo "选项:"
    echo "  --interactive  交互式配置"
    echo "  --copy-only    仅复制模板文件"
    echo "  --validate     验证配置文件"
    echo "  --help         显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/env-setup.sh dev --interactive"
    echo "  ./scripts/env-setup.sh prod --copy-only"
    echo "  ./scripts/env-setup.sh staging --validate"
}

# 生成随机密钥
generate_secret() {
    local length=${1:-64}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# 复制环境配置模板
copy_template() {
    local env=$1
    local template_file="config/production.env.template"
    local target_file=".env.$env"
    
    if [ "$env" = "prod" ]; then
        target_file=".env.production"
    fi
    
    log_info "复制环境配置模板到 $target_file..."
    
    if [ -f "$target_file" ]; then
        log_warning "配置文件 $target_file 已存在"
        read -p "是否覆盖? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "跳过复制"
            return 0
        fi
    fi
    
    cp "$template_file" "$target_file"
    log_success "配置文件已创建: $target_file"
}

# 交互式配置
interactive_setup() {
    local env=$1
    local config_file=".env.$env"
    
    if [ "$env" = "prod" ]; then
        config_file=".env.production"
    fi
    
    log_info "开始交互式配置 $config_file..."
    
    # 应用配置
    echo ""
    echo "=== 应用配置 ==="
    read -p "应用名称 [jq-project-template]: " app_name
    app_name=${app_name:-jq-project-template}
    
    read -p "应用端口 [3000]: " port
    port=${port:-3000}
    
    # 数据库配置
    echo ""
    echo "=== 数据库配置 ==="
    read -p "数据库主机 [mysql]: " db_host
    db_host=${db_host:-mysql}
    
    read -p "数据库端口 [3306]: " db_port
    db_port=${db_port:-3306}
    
    read -p "数据库用户名 [app_user]: " db_user
    db_user=${db_user:-app_user}
    
    read -s -p "数据库密码: " db_password
    echo
    
    read -p "数据库名称 [${env}_db]: " db_name
    db_name=${db_name:-${env}_db}
    
    # JWT配置
    echo ""
    echo "=== JWT配置 ==="
    log_info "生成JWT密钥..."
    jwt_secret=$(generate_secret 64)
    jwt_refresh_secret=$(generate_secret 64)
    
    # Redis配置
    echo ""
    echo "=== Redis配置 ==="
    read -p "Redis主机 [redis]: " redis_host
    redis_host=${redis_host:-redis}
    
    read -p "Redis端口 [6379]: " redis_port
    redis_port=${redis_port:-6379}
    
    read -s -p "Redis密码 (可选): " redis_password
    echo
    
    # CORS配置
    echo ""
    echo "=== 安全配置 ==="
    read -p "允许的CORS源 [*]: " cors_origin
    cors_origin=${cors_origin:-*}
    
    # 更新配置文件
    log_info "更新配置文件..."
    
    sed -i.bak "s/APP_NAME=.*/APP_NAME=$app_name/" "$config_file"
    sed -i.bak "s/PORT=.*/PORT=$port/" "$config_file"
    sed -i.bak "s/DB_HOST=.*/DB_HOST=$db_host/" "$config_file"
    sed -i.bak "s/DB_PORT=.*/DB_PORT=$db_port/" "$config_file"
    sed -i.bak "s/DB_USERNAME=.*/DB_USERNAME=$db_user/" "$config_file"
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$db_password/" "$config_file"
    sed -i.bak "s/DB_NAME=.*/DB_NAME=$db_name/" "$config_file"
    sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" "$config_file"
    sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$jwt_refresh_secret/" "$config_file"
    sed -i.bak "s/REDIS_HOST=.*/REDIS_HOST=$redis_host/" "$config_file"
    sed -i.bak "s/REDIS_PORT=.*/REDIS_PORT=$redis_port/" "$config_file"
    
    if [ -n "$redis_password" ]; then
        sed -i.bak "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$redis_password/" "$config_file"
    fi
    
    sed -i.bak "s|CORS_ORIGIN=.*|CORS_ORIGIN=$cors_origin|" "$config_file"
    
    # 删除备份文件
    rm -f "$config_file.bak"
    
    log_success "配置文件已更新完成"
}

# 验证配置文件
validate_config() {
    local env=$1
    local config_file=".env.$env"
    
    if [ "$env" = "prod" ]; then
        config_file=".env.production"
    fi
    
    log_info "验证配置文件 $config_file..."
    
    if [ ! -f "$config_file" ]; then
        log_error "配置文件不存在: $config_file"
        return 1
    fi
    
    local errors=0
    
    # 检查必需的配置项
    local required_vars=(
        "NODE_ENV"
        "PORT"
        "DB_HOST"
        "DB_PASSWORD"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$config_file"; then
            log_error "缺少必需的配置项: $var"
            ((errors++))
        fi
    done
    
    # 检查JWT密钥长度
    jwt_secret=$(grep "^JWT_SECRET=" "$config_file" | cut -d'=' -f2)
    if [ ${#jwt_secret} -lt 32 ]; then
        log_error "JWT_SECRET 长度不足32个字符"
        ((errors++))
    fi
    
    jwt_refresh_secret=$(grep "^JWT_REFRESH_SECRET=" "$config_file" | cut -d'=' -f2)
    if [ ${#jwt_refresh_secret} -lt 32 ]; then
        log_error "JWT_REFRESH_SECRET 长度不足32个字符"
        ((errors++))
    fi
    
    # 检查危险的默认值
    if grep -q "CHANGE_ME" "$config_file"; then
        log_warning "发现未修改的默认值，请检查并修改"
        grep "CHANGE_ME" "$config_file"
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        log_success "配置文件验证通过"
        return 0
    else
        log_error "配置文件验证失败，发现 $errors 个问题"
        return 1
    fi
}

# 主函数
main() {
    local environment=""
    local interactive=false
    local copy_only=false
    local validate=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|staging|prod)
                environment="$1"
                shift
                ;;
            --interactive)
                interactive=true
                shift
                ;;
            --copy-only)
                copy_only=true
                shift
                ;;
            --validate)
                validate=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 检查环境参数
    if [ -z "$environment" ]; then
        log_error "请指定环境 (dev/staging/prod)"
        show_help
        exit 1
    fi
    
    # 验证模式
    if [ "$validate" = true ]; then
        validate_config $environment
        exit $?
    fi
    
    # 复制模板
    copy_template $environment
    
    # 仅复制模式
    if [ "$copy_only" = true ]; then
        log_success "配置模板已复制完成"
        exit 0
    fi
    
    # 交互式配置
    if [ "$interactive" = true ]; then
        interactive_setup $environment
    fi
    
    # 验证配置
    validate_config $environment
    
    log_success "环境设置完成！"
    echo ""
    echo "下一步:"
    echo "1. 检查并修改配置文件中的值"
    echo "2. 使用 './scripts/deploy.sh $environment' 部署应用"
}

# 执行主函数
main "$@" 
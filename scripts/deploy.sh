#!/bin/bash

# 自动化部署脚本
# 支持多环境部署和回滚功能

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
    echo "自动化部署脚本"
    echo ""
    echo "用法: ./scripts/deploy.sh [选项] [环境]"
    echo ""
    echo "环境:"
    echo "  dev           部署到开发环境"
    echo "  staging       部署到预发布环境"
    echo "  prod          部署到生产环境"
    echo ""
    echo "选项:"
    echo "  --build       构建新镜像"
    echo "  --no-cache    构建时不使用缓存"
    echo "  --rollback    回滚到上一个版本"
    echo "  --health      执行健康检查"
    echo "  --backup      创建数据备份"
    echo "  --migrate     执行数据库迁移"
    echo "  --seed        执行数据库种子"
    echo "  --logs        显示容器日志"
    echo "  --monitor     显示监控信息"
    echo "  --help        显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/deploy.sh dev --build"
    echo "  ./scripts/deploy.sh prod --backup --migrate"
    echo "  ./scripts/deploy.sh prod --rollback"
}

# 检查依赖
check_dependencies() {
    log_info "检查部署依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_success "依赖检查完成"
}

# 设置环境变量
setup_environment() {
    local env=$1
    
    log_info "设置 $env 环境..."
    
    case $env in
        dev)
            COMPOSE_FILE="docker-compose.dev.yml"
            ENV_FILE=".env.dev"
            HEALTH_URL="http://localhost:3000/api/health"
            ;;
        staging)
            COMPOSE_FILE="docker-compose.staging.yml"
            ENV_FILE=".env.staging"
            HEALTH_URL="https://staging.example.com/api/health"
            ;;
        prod)
            COMPOSE_FILE="docker-compose.yml"
            ENV_FILE=".env.production"
            HEALTH_URL="https://api.example.com/api/health"
            ;;
        *)
            log_error "不支持的环境: $env"
            exit 1
            ;;
    esac
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error "环境文件不存在: $ENV_FILE"
        exit 1
    fi
    
    export COMPOSE_FILE
    export ENV_FILE
    export HEALTH_URL
    
    log_success "环境设置完成: $env"
}

# 构建镜像
build_image() {
    local no_cache=$1
    
    log_info "构建Docker镜像..."
    
    local build_args=""
    if [ "$no_cache" = true ]; then
        build_args="--no-cache"
    fi
    
    docker-compose -f $COMPOSE_FILE build $build_args app
    
    log_success "镜像构建完成"
}

# 创建备份
create_backup() {
    log_info "创建数据备份..."
    
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $backup_dir
    
    # 备份数据库
    docker-compose -f $COMPOSE_FILE exec -T mysql mysqldump \
        -u root -p${DB_PASSWORD} ${DB_NAME} > $backup_dir/database.sql
    
    # 备份Redis数据
    docker-compose -f $COMPOSE_FILE exec -T redis redis-cli BGSAVE
    docker cp $(docker-compose -f $COMPOSE_FILE ps -q redis):/data/dump.rdb $backup_dir/
    
    # 备份应用日志
    if [ -d "./logs" ]; then
        cp -r ./logs $backup_dir/
    fi
    
    log_success "备份创建完成: $backup_dir"
    echo $backup_dir > .last_backup
}

# 执行数据库迁移
run_migrations() {
    log_info "执行数据库迁移..."
    
    docker-compose -f $COMPOSE_FILE exec app npm run migration:run
    
    log_success "数据库迁移完成"
}

# 执行种子数据
run_seeds() {
    log_info "执行种子数据..."
    
    docker-compose -f $COMPOSE_FILE exec app npm run seed:auth
    
    log_success "种子数据执行完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s $HEALTH_URL > /dev/null 2>&1; then
            log_success "健康检查通过"
            return 0
        fi
        
        log_info "健康检查失败，重试 $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done
    
    log_error "健康检查失败"
    return 1
}

# 部署应用
deploy_app() {
    log_info "部署应用..."
    
    # 停止现有服务
    docker-compose -f $COMPOSE_FILE down
    
    # 启动新服务
    docker-compose -f $COMPOSE_FILE up -d
    
    # 等待服务启动
    sleep 30
    
    log_success "应用部署完成"
}

# 回滚部署
rollback_deployment() {
    log_info "回滚部署..."
    
    if [ ! -f ".last_backup" ]; then
        log_error "未找到备份信息，无法回滚"
        exit 1
    fi
    
    local backup_dir=$(cat .last_backup)
    
    if [ ! -d "$backup_dir" ]; then
        log_error "备份目录不存在: $backup_dir"
        exit 1
    fi
    
    # 停止当前服务
    docker-compose -f $COMPOSE_FILE down
    
    # 恢复数据库
    if [ -f "$backup_dir/database.sql" ]; then
        log_info "恢复数据库..."
        docker-compose -f $COMPOSE_FILE up -d mysql
        sleep 20
        cat $backup_dir/database.sql | docker-compose -f $COMPOSE_FILE exec -T mysql mysql -u root -p${DB_PASSWORD} ${DB_NAME}
    fi
    
    # 恢复Redis数据
    if [ -f "$backup_dir/dump.rdb" ]; then
        log_info "恢复Redis数据..."
        docker cp $backup_dir/dump.rdb $(docker-compose -f $COMPOSE_FILE ps -q redis):/data/
        docker-compose -f $COMPOSE_FILE restart redis
    fi
    
    # 启动应用
    docker-compose -f $COMPOSE_FILE up -d
    sleep 30
    
    log_success "回滚完成"
}

# 显示日志
show_logs() {
    log_info "显示容器日志..."
    docker-compose -f $COMPOSE_FILE logs -f --tail=100
}

# 显示监控信息
show_monitoring() {
    log_info "显示监控信息..."
    
    echo "=== 容器状态 ==="
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    echo "=== 系统资源 ==="
    docker stats --no-stream $(docker-compose -f $COMPOSE_FILE ps -q)
    
    echo ""
    echo "=== 健康检查 ==="
    curl -s $HEALTH_URL | jq '.' || echo "健康检查API不可用"
}

# 清理资源
cleanup() {
    log_info "清理无用资源..."
    
    # 清理无用镜像
    docker image prune -f
    
    # 清理无用卷
    docker volume prune -f
    
    # 清理无用网络
    docker network prune -f
    
    log_success "资源清理完成"
}

# 主函数
main() {
    local environment=""
    local build=false
    local no_cache=false
    local rollback=false
    local health=false
    local backup=false
    local migrate=false
    local seed=false
    local logs=false
    local monitor=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            dev|staging|prod)
                environment="$1"
                shift
                ;;
            --build)
                build=true
                shift
                ;;
            --no-cache)
                no_cache=true
                shift
                ;;
            --rollback)
                rollback=true
                shift
                ;;
            --health)
                health=true
                shift
                ;;
            --backup)
                backup=true
                shift
                ;;
            --migrate)
                migrate=true
                shift
                ;;
            --seed)
                seed=true
                shift
                ;;
            --logs)
                logs=true
                shift
                ;;
            --monitor)
                monitor=true
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
    if [ -z "$environment" ] && [ "$logs" = false ] && [ "$monitor" = false ]; then
        log_error "请指定部署环境"
        show_help
        exit 1
    fi
    
    # 检查依赖
    check_dependencies
    
    # 处理特殊操作
    if [ "$logs" = true ]; then
        if [ -n "$environment" ]; then
            setup_environment $environment
        else
            COMPOSE_FILE="docker-compose.yml"
        fi
        show_logs
        exit 0
    fi
    
    if [ "$monitor" = true ]; then
        if [ -n "$environment" ]; then
            setup_environment $environment
        else
            COMPOSE_FILE="docker-compose.yml"
        fi
        show_monitoring
        exit 0
    fi
    
    # 设置环境
    setup_environment $environment
    
    # 加载环境变量
    source $ENV_FILE
    
    # 执行回滚
    if [ "$rollback" = true ]; then
        rollback_deployment
        health_check
        exit 0
    fi
    
    # 执行部署流程
    if [ "$backup" = true ]; then
        create_backup
    fi
    
    if [ "$build" = true ]; then
        build_image $no_cache
    fi
    
    deploy_app
    
    if [ "$migrate" = true ]; then
        run_migrations
    fi
    
    if [ "$seed" = true ]; then
        run_seeds
    fi
    
    if [ "$health" = true ] || [ "$environment" = "prod" ]; then
        if ! health_check; then
            log_error "健康检查失败，部署可能有问题"
            exit 1
        fi
    fi
    
    cleanup
    
    log_success "部署完成！"
}

# 执行主函数
main "$@" 
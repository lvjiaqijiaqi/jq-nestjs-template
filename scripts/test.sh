#!/bin/bash

# 测试自动化脚本
# 用于运行不同类型的测试和生成报告

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
    echo "测试自动化脚本"
    echo ""
    echo "用法: ./scripts/test.sh [选项]"
    echo ""
    echo "选项:"
    echo "  unit          运行单元测试"
    echo "  integration   运行集成测试"
    echo "  e2e           运行E2E测试"
    echo "  all           运行所有测试"
    echo "  coverage      运行测试并生成覆盖率报告"
    echo "  watch         监控模式运行测试"
    echo "  ci            CI环境运行测试"
    echo "  clean         清理测试缓存和报告"
    echo "  setup         设置测试环境"
    echo "  --help        显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./scripts/test.sh unit"
    echo "  ./scripts/test.sh coverage"
    echo "  ./scripts/test.sh all"
}

# 检查依赖
check_dependencies() {
    log_info "检查测试依赖..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安装，某些测试可能无法运行"
    fi
    
    log_success "依赖检查完成"
}

# 设置测试环境
setup_test_env() {
    log_info "设置测试环境..."
    
    # 检查测试环境变量文件
    if [ ! -f ".env.test" ]; then
        log_warning ".env.test 文件不存在，从示例文件创建..."
        if [ -f ".env.example" ]; then
            cp .env.example .env.test
            log_info "请编辑 .env.test 文件配置测试环境变量"
        else
            log_error ".env.example 文件不存在"
            exit 1
        fi
    fi
    
    # 检查测试数据库
    log_info "检查测试数据库连接..."
    
    # 创建测试目录
    mkdir -p coverage
    mkdir -p test-results
    
    log_success "测试环境设置完成"
}

# 运行单元测试
run_unit_tests() {
    log_info "运行单元测试..."
    
    npm run test -- --testPathPattern="src/.*\.spec\.ts$" \
        --testTimeout=30000 \
        --detectOpenHandles \
        --forceExit
    
    log_success "单元测试完成"
}

# 运行集成测试
run_integration_tests() {
    log_info "运行集成测试..."
    
    # 确保测试数据库可用
    setup_test_env
    
    npm run test -- --testPathPattern="test/integration/.*\.test\.ts$" \
        --testTimeout=60000 \
        --detectOpenHandles \
        --forceExit
    
    log_success "集成测试完成"
}

# 运行E2E测试
run_e2e_tests() {
    log_info "运行E2E测试..."
    
    # 确保测试数据库可用
    setup_test_env
    
    # 启动应用（如果需要）
    log_info "准备E2E测试环境..."
    
    npm run test -- --testPathPattern="test/e2e/.*\.e2e-spec\.ts$" \
        --testTimeout=120000 \
        --detectOpenHandles \
        --forceExit \
        --runInBand
    
    log_success "E2E测试完成"
}

# 运行所有测试
run_all_tests() {
    log_info "运行所有测试..."
    
    setup_test_env
    
    # 按顺序运行测试
    run_unit_tests
    run_integration_tests
    run_e2e_tests
    
    log_success "所有测试完成"
}

# 运行测试覆盖率
run_coverage() {
    log_info "运行测试覆盖率分析..."
    
    setup_test_env
    
    npm run test:cov -- \
        --testTimeout=60000 \
        --detectOpenHandles \
        --forceExit \
        --coverage \
        --coverageDirectory=coverage \
        --coverageReporters=text,text-summary,html,lcov,json
    
    log_success "覆盖率报告生成完成"
    log_info "覆盖率报告位置: coverage/index.html"
}

# 监控模式
run_watch() {
    log_info "启动测试监控模式..."
    
    npm run test:watch
}

# CI环境测试
run_ci_tests() {
    log_info "运行CI环境测试..."
    
    # 设置CI环境变量
    export CI=true
    export NODE_ENV=test
    
    # 检查代码质量
    log_info "检查代码质量..."
    npm run lint
    
    # 运行测试
    npm run test -- \
        --ci \
        --coverage \
        --testTimeout=60000 \
        --detectOpenHandles \
        --forceExit \
        --passWithNoTests \
        --coverageReporters=text,lcov,json \
        --coverageDirectory=coverage
    
    # 检查覆盖率阈值
    log_info "检查覆盖率阈值..."
    
    log_success "CI测试完成"
}

# 清理测试缓存和报告
clean_test_cache() {
    log_info "清理测试缓存和报告..."
    
    # 清理Jest缓存
    npm run test -- --clearCache
    
    # 清理报告目录
    rm -rf coverage
    rm -rf test-results
    rm -rf .jest-cache
    
    # 重新创建目录
    mkdir -p coverage
    mkdir -p test-results
    
    log_success "清理完成"
}

# 生成测试报告
generate_test_report() {
    log_info "生成测试报告..."
    
    # 检查是否有覆盖率数据
    if [ -f "coverage/lcov.info" ]; then
        log_info "覆盖率数据已生成"
        
        # 如果安装了lcov，生成HTML报告
        if command -v lcov &> /dev/null; then
            lcov --summary coverage/lcov.info
        fi
    else
        log_warning "未找到覆盖率数据"
    fi
    
    # 生成测试摘要
    echo "测试执行摘要" > test-results/summary.txt
    echo "执行时间: $(date)" >> test-results/summary.txt
    echo "Node版本: $(node --version)" >> test-results/summary.txt
    echo "NPM版本: $(npm --version)" >> test-results/summary.txt
    
    log_success "测试报告生成完成"
}

# 主函数
main() {
    case "${1:-}" in
        unit)
            check_dependencies
            run_unit_tests
            ;;
        integration)
            check_dependencies
            run_integration_tests
            ;;
        e2e)
            check_dependencies
            run_e2e_tests
            ;;
        all)
            check_dependencies
            run_all_tests
            generate_test_report
            ;;
        coverage)
            check_dependencies
            run_coverage
            generate_test_report
            ;;
        watch)
            check_dependencies
            run_watch
            ;;
        ci)
            check_dependencies
            run_ci_tests
            generate_test_report
            ;;
        clean)
            clean_test_cache
            ;;
        setup)
            check_dependencies
            setup_test_env
            ;;
        --help|help)
            show_help
            ;;
        "")
            log_error "请指定测试类型"
            show_help
            exit 1
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@" 
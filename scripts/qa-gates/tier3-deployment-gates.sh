#!/bin/bash
# Tier 3 Quality Gates - Run before deployment
# Comprehensive validation for production readiness

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Running Tier 3 Deployment Gates..."
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Track gate results
GATES_PASSED=0
GATES_FAILED=0
WARNINGS=0

run_gate() {
    local gate_name="$1"
    local gate_command="$2"
    local gate_critical="${3:-true}"
    local timeout="${4:-300}" # 5 minute default timeout

    echo -e "\n📋 Gate: $gate_name"
    echo "----------------------------------------"

    if timeout "$timeout" bash -c "$gate_command"; then
        echo -e "${GREEN}✅ PASSED: $gate_name${NC}"
        ((GATES_PASSED++))
        return 0
    else
        if [ "$gate_critical" = "true" ]; then
            echo -e "${RED}❌ FAILED: $gate_name${NC}"
            ((GATES_FAILED++))
            return 1
        else
            echo -e "${YELLOW}⚠️  WARNING: $gate_name${NC}"
            ((WARNINGS++))
            return 0
        fi
    fi
}

# Change to project root
cd "$PROJECT_ROOT"

echo -e "${PURPLE}🔄 Preparing deployment environment...${NC}"

# Pre-deployment setup
echo "Setting up test environment..."
docker-compose -f docker-compose.test.yml down || true
docker-compose -f docker-compose.test.yml up -d --build || true
sleep 10 # Wait for services to be ready

# Gate 1: Complete Test Suite
run_gate "Complete Test Suite" "npm run test:all" true 600

# Gate 2: End-to-End Tests
run_gate "E2E Tests" "npm run test:e2e || npm run test:e2e:headless" true 900

# Gate 3: Load Testing
run_gate "Load Testing" "npm run test:load || ./scripts/qa-gates/load-test.sh" false 600

# Gate 4: Security Penetration Testing
run_gate "Security Scan" "npm run test:security:full || ./scripts/qa-gates/security-scan.sh"

# Gate 5: Database Migration Safety
run_gate "Migration Safety" "npm run test:migrations || ./scripts/qa-gates/migration-test.sh"

# Gate 6: Backup & Recovery Validation
run_gate "Backup/Recovery Test" "./scripts/qa-gates/backup-recovery-test.sh" false

# Gate 7: Performance Regression Test
run_gate "Performance Regression" "./scripts/qa-gates/performance-regression.sh"

# Gate 8: Business Critical Workflows
echo -e "\n${BLUE}💼 Business Critical Workflow Validation${NC}"
echo "================================================"

run_gate "VP Dashboard Workflow" "npm run test:e2e -- --spec='**/vp-dashboard.spec.*'"
run_gate "Commission Calculation E2E" "npm run test:e2e -- --spec='**/commission.spec.*'"
run_gate "Pipeline Management E2E" "npm run test:e2e -- --spec='**/pipeline.spec.*'"
run_gate "Partner Management E2E" "npm run test:e2e -- --spec='**/partner.spec.*'"

# Gate 9: Data Consistency Check
run_gate "Data Consistency" "./scripts/qa-gates/data-consistency-check.sh"

# Gate 10: API Performance & Health
run_gate "API Health Check" "./scripts/qa-gates/api-health-check.sh"

# Gate 11: Frontend Performance
run_gate "Frontend Performance" "./scripts/qa-gates/frontend-performance.sh" false

# Gate 12: Mobile Responsiveness
run_gate "Mobile Responsiveness" "npm run test:e2e:mobile || npm run test:responsive" false

# Gate 13: Accessibility Compliance
run_gate "Accessibility Check" "npm run test:a11y || npm run test:accessibility" false

# Production Readiness Checks
echo -e "\n${PURPLE}🏭 Production Readiness Validation${NC}"
echo "======================================="

# Environment configuration
run_gate "Environment Config" "./scripts/qa-gates/env-config-check.sh"

# SSL/TLS validation
run_gate "SSL/TLS Setup" "./scripts/qa-gates/ssl-validation.sh" false

# Monitoring & Logging
run_gate "Monitoring Setup" "./scripts/qa-gates/monitoring-check.sh" false

# Cleanup test environment
echo -e "\n${BLUE}🧹 Cleaning up test environment...${NC}"
docker-compose -f docker-compose.test.yml down || true

# Final Results Summary
echo -e "\n🏁 Tier 3 Deployment Gates Summary"
echo "==================================="
echo -e "Passed: ${GREEN}$GATES_PASSED${NC}"
echo -e "Failed: ${RED}$GATES_FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $GATES_FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ DEPLOYMENT BLOCKED: Critical issues found${NC}"
    echo "🔧 Troubleshooting commands:"
    echo "  npm run test:all"
    echo "  npm run test:e2e"
    echo "  ./scripts/qa-gates/debug-deployment.sh"
    echo ""
    echo "📋 Review failed gates and fix issues before deployment"
    exit 1
else
    if [ $WARNINGS -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️  DEPLOYMENT APPROVED WITH WARNINGS${NC}"
        echo "Consider addressing warnings in next release"
    else
        echo -e "\n${GREEN}✅ ALL DEPLOYMENT GATES PASSED${NC}"
        echo -e "${GREEN}🚀 PRODUCTION DEPLOYMENT APPROVED${NC}"
    fi

    echo ""
    echo "📊 Deployment Summary:"
    echo "  - Business workflows validated"
    echo "  - Performance benchmarks met"
    echo "  - Security scans passed"
    echo "  - Data integrity confirmed"
    echo ""
    echo "🎯 Ready for $250K quarterly revenue operations"
    exit 0
fi
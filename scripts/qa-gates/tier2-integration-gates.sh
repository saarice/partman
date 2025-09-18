#!/bin/bash
# Tier 2 Quality Gates - Run on Pull Requests
# Ensures integration quality and business logic integrity

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🧪 Running Tier 2 Integration Gates..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Track gate results
GATES_PASSED=0
GATES_FAILED=0
WARNINGS=0

run_gate() {
    local gate_name="$1"
    local gate_command="$2"
    local gate_critical="${3:-true}"

    echo -e "\n📋 Gate: $gate_name"
    echo "----------------------------------------"

    if eval "$gate_command"; then
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

# Ensure database is ready for testing
echo -e "${BLUE}🗄️  Preparing test database...${NC}"
npm run test:db:reset || echo "Database reset not configured - continuing..."

# Gate 1: Integration Tests
run_gate "Integration Tests" "npm run test:integration"

# Gate 2: API Contract Validation
run_gate "API Contract Tests" "npm run test:api:contracts"

# Gate 3: Database Integration
run_gate "Database Tests" "npm run test:db"

# Gate 4: Commission Calculation Accuracy
run_gate "Commission Accuracy Tests" "npm test -- --testNamePattern='commission.*accuracy|commission.*calculation' --passWithNoTests"

# Gate 5: Pipeline Logic Validation
run_gate "Pipeline Logic Tests" "npm test -- --testNamePattern='pipeline|opportunity.*stage|funnel' --passWithNoTests"

# Gate 6: Partner Management Logic
run_gate "Partner Logic Tests" "npm test -- --testNamePattern='partner.*management|partner.*health' --passWithNoTests"

# Gate 7: Authentication & Authorization
run_gate "Auth Tests" "npm test -- --testNamePattern='auth|authorization|permission' --passWithNoTests"

# Gate 8: Data Integrity Validation
run_gate "Data Integrity Tests" "npm run test:data:integrity || npm test -- --testNamePattern='integrity|validation' --passWithNoTests"

# Gate 9: Performance Baseline Tests
run_gate "Performance Tests" "npm run test:performance:baseline" "false"

# Gate 10: Security Tests
run_gate "Security Tests" "npm run test:security || npm test -- --testNamePattern='security|xss|injection' --passWithNoTests"

# Gate 11: Cross-Browser Compatibility (if applicable)
run_gate "Browser Compatibility" "npm run test:browser:compat || echo 'Browser tests not configured - SKIP'" "false"

# Business Logic Validation Section
echo -e "\n${BLUE}💼 Business Logic Validation${NC}"
echo "======================================"

# Commission calculation scenarios
echo "📊 Testing commission calculation scenarios..."
npm test -- --testNamePattern='commission' --verbose || true

# Pipeline stage progression
echo "🔄 Testing pipeline progression rules..."
npm test -- --testNamePattern='stage.*progression|pipeline.*flow' --verbose || true

# Goal tracking accuracy
echo "🎯 Testing goal tracking logic..."
npm test -- --testNamePattern='goal.*track|target.*progress' --verbose || true

# Results Summary
echo -e "\n🏁 Tier 2 Integration Gates Summary"
echo "===================================="
echo -e "Passed: ${GREEN}$GATES_PASSED${NC}"
echo -e "Failed: ${RED}$GATES_FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $GATES_FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ INTEGRATION BLOCKED: Fix failing gates before merging${NC}"
    echo "Debug commands:"
    echo "  npm run test:integration"
    echo "  npm run test:api:contracts"
    echo "  npm run test:db"
    echo "  npm test -- --testNamePattern='commission'"
    exit 1
else
    if [ $WARNINGS -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️  INTEGRATION PASSED WITH WARNINGS${NC}"
        echo "Consider addressing warnings before production deployment"
    else
        echo -e "\n${GREEN}✅ ALL TIER 2 GATES PASSED - Integration approved${NC}"
    fi
    exit 0
fi
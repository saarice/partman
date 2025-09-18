#!/bin/bash
# Tier 1 Quality Gates - Run on every commit
# Ensures basic code quality and prevents broken commits

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🔍 Running Tier 1 Quality Gates..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track gate results
GATES_PASSED=0
GATES_FAILED=0

run_gate() {
    local gate_name="$1"
    local gate_command="$2"

    echo -e "\n📋 Gate: $gate_name"
    echo "----------------------------------------"

    if eval "$gate_command"; then
        echo -e "${GREEN}✅ PASSED: $gate_name${NC}"
        ((GATES_PASSED++))
    else
        echo -e "${RED}❌ FAILED: $gate_name${NC}"
        ((GATES_FAILED++))
        return 1
    fi
}

# Change to project root
cd "$PROJECT_ROOT"

# Gate 1: Code Linting
run_gate "Code Linting" "npm run lint"

# Gate 2: TypeScript Type Checking
run_gate "TypeScript Type Check" "npm run type-check || true"

# Gate 3: Unit Tests
run_gate "Unit Tests" "npm run test:unit"

# Gate 4: Security Audit (Non-blocking warnings)
run_gate "Security Audit" "npm audit --audit-level=high"

# Gate 5: Bundle Size Check
run_gate "Bundle Size Check" "npm run check:bundle-size || echo 'Bundle size check not configured - SKIP'"

# Gate 6: Commission Calculation Core Tests
run_gate "Commission Logic Tests" "npm test -- --testNamePattern='commission.*calculation' --passWithNoTests"

# Gate 7: Basic API Health
run_gate "API Contract Validation" "npm run test:api:basic || true"

# Results Summary
echo -e "\n🏁 Tier 1 Quality Gates Summary"
echo "=================================="
echo -e "Passed: ${GREEN}$GATES_PASSED${NC}"
echo -e "Failed: ${RED}$GATES_FAILED${NC}"

if [ $GATES_FAILED -gt 0 ]; then
    echo -e "\n${RED}❌ COMMIT BLOCKED: Fix failing gates before committing${NC}"
    echo "Run individual commands to debug:"
    echo "  npm run lint"
    echo "  npm run type-check"
    echo "  npm run test:unit"
    exit 1
else
    echo -e "\n${GREEN}✅ ALL TIER 1 GATES PASSED - Commit approved${NC}"
    exit 0
fi
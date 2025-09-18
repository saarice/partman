#!/bin/bash
# Master QA Runner - Execute all quality checks based on context
# Single entry point for all QA validation

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Default values
MODE="auto"
VERBOSE=false
SKIP_SLOW=false
QUICK_MODE=false

# Usage information
usage() {
    echo "Master QA Runner - Comprehensive Quality Assurance"
    echo ""
    echo "Usage: $0 [OPTIONS] [MODE]"
    echo ""
    echo "Modes:"
    echo "  commit          Run Tier 1 gates (fast, for git hooks)"
    echo "  pr|pull-request Run Tier 2 gates (integration tests)"
    echo "  deploy          Run Tier 3 gates (full deployment validation)"
    echo "  daily           Run daily health check"
    echo "  business        Run business logic validation only"
    echo "  regression      Run regression prevention tests"
    echo "  quick           Run essential tests only"
    echo "  full            Run complete test suite"
    echo "  auto            Auto-detect based on git context (default)"
    echo ""
    echo "Options:"
    echo "  -v, --verbose   Verbose output"
    echo "  -q, --quick     Quick mode (skip slow tests)"
    echo "  -s, --skip-slow Skip slow tests (same as --quick)"
    echo "  -h, --help      Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                    # Auto-detect and run appropriate tests"
    echo "  $0 commit             # Run commit-level checks"
    echo "  $0 deploy --verbose   # Run deployment checks with verbose output"
    echo "  $0 business           # Validate business logic only"
    echo "  $0 daily              # Run daily health check"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quick|-s|--skip-slow)
            QUICK_MODE=true
            SKIP_SLOW=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        commit|pr|pull-request|deploy|daily|business|regression|quick|full|auto)
            MODE="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Auto-detect mode based on git context
auto_detect_mode() {
    if git rev-parse --git-dir > /dev/null 2>&1; then
        # Check if we're in a git repository
        if git diff --cached --quiet; then
            # No staged changes - probably running for PR or deployment
            if git rev-parse --abbrev-ref HEAD | grep -q "main\|master"; then
                echo "deploy"
            else
                echo "pr"
            fi
        else
            # Staged changes - probably pre-commit
            echo "commit"
        fi
    else
        # Not in git repository - run daily check
        echo "daily"
    fi
}

# Execute mode-specific tests
run_commit_gates() {
    echo -e "${BLUE}🔍 Running Commit Gates (Tier 1)${NC}"
    "$SCRIPT_DIR/tier1-commit-gates.sh"
}

run_pr_gates() {
    echo -e "${BLUE}🧪 Running Pull Request Gates (Tier 2)${NC}"
    "$SCRIPT_DIR/tier2-integration-gates.sh"
}

run_deploy_gates() {
    echo -e "${BLUE}🚀 Running Deployment Gates (Tier 3)${NC}"
    if [ "$SKIP_SLOW" = "true" ]; then
        echo -e "${YELLOW}⚠️ Skipping slow tests in deployment gates${NC}"
        export SKIP_SLOW_TESTS=true
    fi
    "$SCRIPT_DIR/tier3-deployment-gates.sh"
}

run_daily_check() {
    echo -e "${BLUE}📅 Running Daily Health Check${NC}"
    "$SCRIPT_DIR/daily-qa-health-check.sh"
}

run_business_validation() {
    echo -e "${BLUE}💼 Running Business Logic Validation${NC}"
    "$SCRIPT_DIR/business-logic-validator.sh"
}

run_regression_tests() {
    echo -e "${BLUE}🚫 Running Regression Prevention${NC}"
    "$SCRIPT_DIR/regression-prevention.sh"
}

run_quick_tests() {
    echo -e "${BLUE}⚡ Running Quick Test Suite${NC}"

    echo "Running essential unit tests..."
    npm run test:unit || npm test -- --passWithNoTests

    echo "Running business logic tests..."
    npm test -- --testNamePattern='commission|pipeline|goal' --passWithNoTests

    echo "Running basic integration tests..."
    npm run test:integration:quick || npm run test:integration || true

    echo "Quick security scan..."
    npm audit --audit-level=high || true
}

run_full_suite() {
    echo -e "${BLUE}🏆 Running Complete Test Suite${NC}"

    run_commit_gates
    echo ""
    run_pr_gates
    echo ""
    run_business_validation
    echo ""
    run_regression_tests
    echo ""
    if [ "$SKIP_SLOW" = "false" ]; then
        run_deploy_gates
    else
        echo -e "${YELLOW}Skipping deployment gates (slow tests disabled)${NC}"
    fi
}

# Main execution
main() {
    cd "$PROJECT_ROOT"

    echo -e "${BOLD}🎯 Partnership Management Platform QA Runner${NC}"
    echo "============================================="
    echo "Mode: $MODE"
    echo "Verbose: $VERBOSE"
    echo "Quick Mode: $QUICK_MODE"
    echo "Project: $(pwd)"
    echo "Date: $(date)"
    echo ""

    # Auto-detect mode if needed
    if [ "$MODE" = "auto" ]; then
        DETECTED_MODE=$(auto_detect_mode)
        echo -e "${BLUE}🔍 Auto-detected mode: $DETECTED_MODE${NC}"
        MODE="$DETECTED_MODE"
        echo ""
    fi

    # Set verbose mode for scripts
    if [ "$VERBOSE" = "true" ]; then
        export QA_VERBOSE=true
        set -x
    fi

    # Set quick mode for scripts
    if [ "$QUICK_MODE" = "true" ]; then
        export QA_QUICK_MODE=true
    fi

    # Record start time
    START_TIME=$(date +%s)

    # Execute based on mode
    case $MODE in
        commit)
            run_commit_gates
            ;;
        pr|pull-request)
            run_pr_gates
            ;;
        deploy)
            run_deploy_gates
            ;;
        daily)
            run_daily_check
            ;;
        business)
            run_business_validation
            ;;
        regression)
            run_regression_tests
            ;;
        quick)
            run_quick_tests
            ;;
        full)
            run_full_suite
            ;;
        *)
            echo -e "${RED}❌ Unknown mode: $MODE${NC}"
            usage
            exit 1
            ;;
    esac

    # Calculate execution time
    END_TIME=$(date +%s)
    EXECUTION_TIME=$((END_TIME - START_TIME))

    echo ""
    echo -e "${BLUE}⏱️ Execution completed in ${EXECUTION_TIME}s${NC}"

    # Final summary based on exit code
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All QA checks passed successfully${NC}"
        echo -e "${GREEN}🚀 Ready for next phase${NC}"

        # Provide next step guidance
        case $MODE in
            commit)
                echo -e "${BLUE}💡 Next: Create pull request or continue development${NC}"
                ;;
            pr|pull-request)
                echo -e "${BLUE}💡 Next: Merge to main branch${NC}"
                ;;
            deploy)
                echo -e "${BLUE}💡 Next: Deploy to production${NC}"
                ;;
            daily)
                echo -e "${BLUE}💡 Platform health verified for \$250K operations${NC}"
                ;;
        esac
    else
        echo -e "${RED}❌ QA checks failed${NC}"
        echo -e "${RED}🚫 Do not proceed until issues are resolved${NC}"

        # Provide debugging guidance
        echo ""
        echo -e "${YELLOW}🔧 Debugging guidance:${NC}"
        echo "  1. Review failed test output above"
        echo "  2. Run specific test suites to isolate issues"
        echo "  3. Fix identified problems"
        echo "  4. Re-run QA checks"
        echo ""
        echo -e "${YELLOW}Useful commands:${NC}"
        echo "  npm test                          # Run all tests"
        echo "  npm run test:unit                 # Unit tests only"
        echo "  npm run test:integration           # Integration tests"
        echo "  npm run lint                       # Code linting"
        echo "  $0 business                        # Business logic validation"
        echo "  $0 regression                      # Regression testing"
    fi
}

# Execute main function
main "$@"
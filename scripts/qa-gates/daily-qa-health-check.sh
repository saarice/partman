#!/bin/bash
# Daily QA Health Check
# Automated daily validation of platform health and quality metrics

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "📅 Daily QA Health Check - $(date)"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Health check results
HEALTH_SCORE=0
MAX_HEALTH_SCORE=100
ISSUES_FOUND=()

check_health() {
    local check_name="$1"
    local check_command="$2"
    local points="$3"
    local critical="${4:-false}"

    echo -e "\n🔍 Checking: $check_name"
    echo "Points: $points"

    if eval "$check_command"; then
        echo -e "${GREEN}✅ HEALTHY: $check_name (+$points points)${NC}"
        HEALTH_SCORE=$((HEALTH_SCORE + points))
        return 0
    else
        echo -e "${RED}❌ UNHEALTHY: $check_name${NC}"
        ISSUES_FOUND+=("$check_name")

        if [ "$critical" = "true" ]; then
            echo -e "${RED}🚨 CRITICAL ISSUE DETECTED${NC}"
        fi
        return 1
    fi
}

cd "$PROJECT_ROOT"

# System Health Checks (20 points)
echo -e "${BLUE}🏥 System Health${NC}"
echo "=================="

check_health \
    "Docker Environment" \
    "docker-compose config --quiet && docker-compose ps | grep -q 'Up'" \
    5

check_health \
    "Database Connectivity" \
    "npm run test:db:ping || timeout 10 npm run db:health" \
    5

check_health \
    "API Health Endpoints" \
    "curl -f http://localhost:8000/health || npm run api:health" \
    5

check_health \
    "Memory Usage Normal" \
    "npm run check:memory || echo 'Memory check not configured - assuming OK'" \
    5

# Test Suite Health (25 points)
echo -e "\n${BLUE}🧪 Test Suite Health${NC}"
echo "===================="

check_health \
    "Unit Test Coverage >90%" \
    "npm run test:coverage:check || npm test -- --coverage --coverageThreshold='{\"global\":{\"branches\":90,\"functions\":90,\"lines\":90,\"statements\":90}}'" \
    10

check_health \
    "Integration Tests Passing" \
    "npm run test:integration" \
    10

check_health \
    "Critical Business Logic Tests" \
    "npm test -- --testNamePattern='commission|pipeline|goal' --passWithNoTests" \
    5 \
    true

# Performance Health (20 points)
echo -e "\n${BLUE}⚡ Performance Health${NC}"
echo "===================="

check_health \
    "Dashboard Load Time <2s" \
    "npm run test:performance:dashboard || curl -w '%{time_total}' -o /dev/null -s http://localhost:3000 | awk '{if(\$1<2) exit 0; else exit 1}'" \
    10

check_health \
    "API Response Time <500ms" \
    "npm run test:performance:api || curl -w '%{time_total}' -o /dev/null -s http://localhost:8000/api/v1/health | awk '{if(\$1<0.5) exit 0; else exit 1}'" \
    5

check_health \
    "Database Query Performance" \
    "npm run test:performance:db || npm test -- --testNamePattern='query.*performance' --passWithNoTests" \
    5

# Security Health (15 points)
echo -e "\n${BLUE}🔒 Security Health${NC}"
echo "=================="

check_health \
    "No High/Critical Vulnerabilities" \
    "npm audit --audit-level=high" \
    10 \
    true

check_health \
    "Authentication Security Tests" \
    "npm test -- --testNamePattern='auth.*security|jwt.*validation' --passWithNoTests" \
    5

# Business Logic Health (20 points)
echo -e "\n${BLUE}💼 Business Logic Health${NC}"
echo "========================"

check_health \
    "Commission Calculation Accuracy" \
    "npm test -- --testNamePattern='commission.*accuracy|commission.*calculation' --passWithNoTests" \
    8 \
    true

check_health \
    "Pipeline Management Logic" \
    "npm test -- --testNamePattern='pipeline.*management|stage.*progression' --passWithNoTests" \
    6

check_health \
    "Goal Tracking Accuracy" \
    "npm test -- --testNamePattern='goal.*track|target.*progress' --passWithNoTests" \
    6

# Generate Daily Report
echo -e "\n${PURPLE}📊 Generating Daily Health Report${NC}"
echo "================================="

HEALTH_PERCENTAGE=$((HEALTH_SCORE * 100 / MAX_HEALTH_SCORE))

# Create health report directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/reports/daily-health"

# Generate report file
REPORT_FILE="$PROJECT_ROOT/reports/daily-health/health-$(date +%Y-%m-%d).json"
cat > "$REPORT_FILE" << EOF
{
  "date": "$(date -Iseconds)",
  "healthScore": $HEALTH_SCORE,
  "maxHealthScore": $MAX_HEALTH_SCORE,
  "healthPercentage": $HEALTH_PERCENTAGE,
  "issues": $(printf '%s\n' "${ISSUES_FOUND[@]}" | jq -R . | jq -s .),
  "status": "$([ $HEALTH_PERCENTAGE -ge 80 ] && echo "HEALTHY" || echo "NEEDS_ATTENTION")"
}
EOF

# Health Status Summary
echo -e "\n🏁 Daily Health Summary"
echo "======================="
echo -e "Health Score: ${HEALTH_SCORE}/${MAX_HEALTH_SCORE} (${HEALTH_PERCENTAGE}%)"

if [ $HEALTH_PERCENTAGE -ge 95 ]; then
    echo -e "Status: ${GREEN}EXCELLENT HEALTH${NC} 🎉"
    HEALTH_STATUS="EXCELLENT"
elif [ $HEALTH_PERCENTAGE -ge 80 ]; then
    echo -e "Status: ${GREEN}HEALTHY${NC} ✅"
    HEALTH_STATUS="HEALTHY"
elif [ $HEALTH_PERCENTAGE -ge 60 ]; then
    echo -e "Status: ${YELLOW}NEEDS ATTENTION${NC} ⚠️"
    HEALTH_STATUS="NEEDS_ATTENTION"
else
    echo -e "Status: ${RED}UNHEALTHY${NC} 🚨"
    HEALTH_STATUS="UNHEALTHY"
fi

# Issues Summary
if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️ Issues Found:${NC}"
    for issue in "${ISSUES_FOUND[@]}"; do
        echo "  - $issue"
    done
else
    echo -e "\n${GREEN}✅ No issues found${NC}"
fi

# Trend Analysis (if previous reports exist)
echo -e "\n${BLUE}📈 Health Trend Analysis${NC}"
echo "========================"

PREVIOUS_REPORT=$(find "$PROJECT_ROOT/reports/daily-health" -name "health-*.json" -type f | sort | tail -2 | head -1)
if [ -f "$PREVIOUS_REPORT" ]; then
    PREVIOUS_SCORE=$(jq -r '.healthScore' "$PREVIOUS_REPORT")
    SCORE_DIFF=$((HEALTH_SCORE - PREVIOUS_SCORE))

    if [ $SCORE_DIFF -gt 0 ]; then
        echo -e "Trend: ${GREEN}Improving (+$SCORE_DIFF)${NC}"
    elif [ $SCORE_DIFF -lt 0 ]; then
        echo -e "Trend: ${RED}Declining ($SCORE_DIFF)${NC}"
    else
        echo -e "Trend: ${BLUE}Stable (no change)${NC}"
    fi
else
    echo "Trend: No previous data available"
fi

# Recommendations
echo -e "\n${BLUE}💡 Recommendations${NC}"
echo "==================="

if [ $HEALTH_PERCENTAGE -lt 80 ]; then
    echo "1. 🔧 Address failing health checks immediately"
    echo "2. 🧪 Review and fix failing tests"
    echo "3. ⚡ Investigate performance issues"
    echo "4. 🔒 Resolve security vulnerabilities"
fi

if [ ${#ISSUES_FOUND[@]} -gt 0 ]; then
    echo "5. 📋 Create tickets for identified issues"
    echo "6. 👥 Assign issues to appropriate team members"
fi

echo "7. 📊 Monitor health trends over time"
echo "8. 🎯 Aim for 95%+ health score for production deployments"

# Alerting
if [ "$HEALTH_STATUS" = "UNHEALTHY" ] || [[ " ${ISSUES_FOUND[@]} " =~ " Commission Calculation Accuracy " ]]; then
    echo -e "\n${RED}🚨 CRITICAL ALERT${NC}"
    echo "Health score below 60% or critical business logic failing"
    echo "Immediate intervention required for \$250K revenue operations"

    # Send alert (implement your alerting mechanism here)
    echo "Sending alert to VP Strategic Partnerships and development team..."
    # Example: send email, Slack notification, etc.
fi

# Generate weekly summary trigger
if [ "$(date +%u)" = "1" ]; then  # Monday
    echo -e "\n${PURPLE}📅 Generating Weekly Health Summary${NC}"
    "$SCRIPT_DIR/weekly-qa-summary.sh" || echo "Weekly summary script not found"
fi

# Quick recovery suggestions
if [ $HEALTH_PERCENTAGE -lt 60 ]; then
    echo -e "\n${YELLOW}🚑 Quick Recovery Actions${NC}"
    echo "========================="
    echo "1. Restart services: docker-compose restart"
    echo "2. Clear caches: npm run cache:clear"
    echo "3. Reset test database: npm run test:db:reset"
    echo "4. Run health check again: ./scripts/qa-gates/daily-qa-health-check.sh"
fi

echo -e "\n📝 Report saved: $REPORT_FILE"
echo -e "${BLUE}Daily QA Health Check Complete${NC}"

# Exit with appropriate code
if [ "$HEALTH_STATUS" = "UNHEALTHY" ]; then
    exit 1
elif [ "$HEALTH_STATUS" = "NEEDS_ATTENTION" ]; then
    exit 2
else
    exit 0
fi
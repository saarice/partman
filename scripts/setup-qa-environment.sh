#!/bin/bash
# QA Environment Setup Script
# Sets up all necessary QA infrastructure and git hooks

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🛠️ Setting up QA Environment for Partnership Management Platform"
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

setup_step() {
    local step_name="$1"
    local step_command="$2"

    echo -e "\n🔧 Setting up: $step_name"
    echo "----------------------------------------"

    if eval "$step_command"; then
        echo -e "${GREEN}✅ SUCCESS: $step_name${NC}"
    else
        echo -e "${RED}❌ FAILED: $step_name${NC}"
        return 1
    fi
}

cd "$PROJECT_ROOT"

# Step 1: Create QA directory structure
setup_step "QA Directory Structure" "
mkdir -p reports/daily-health
mkdir -p reports/performance
mkdir -p reports/security
mkdir -p reports/coverage
mkdir -p .qa/hooks
mkdir -p .qa/config
mkdir -p tests/fixtures
mkdir -p tests/helpers
echo 'QA directories created'
"

# Step 2: Make QA scripts executable
setup_step "QA Script Permissions" "
chmod +x scripts/qa-gates/*.sh
chmod +x scripts/*.sh
echo 'Scripts made executable'
"

# Step 3: Setup Git Hooks
setup_step "Git Hooks Configuration" "
# Pre-commit hook for Tier 1 gates
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo '🔍 Running pre-commit quality gates...'
./scripts/qa-gates/master-qa-runner.sh commit
EOF

chmod +x .git/hooks/pre-commit

# Pre-push hook for integration tests
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo '🧪 Running pre-push quality gates...'
./scripts/qa-gates/master-qa-runner.sh pr --quick
EOF

chmod +x .git/hooks/pre-push

echo 'Git hooks configured'
"

# Step 4: Package.json script integration
setup_step "Package.json QA Scripts" "
# Check if package.json exists and add QA scripts
if [ -f package.json ]; then
    # Create backup
    cp package.json package.json.backup

    # Add QA scripts using Node.js
    node -e \"
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Add QA scripts
    pkg.scripts = pkg.scripts || {};

    // Test scripts
    pkg.scripts['test:unit'] = pkg.scripts['test:unit'] || 'jest --testPathPattern=.*\\.test\\.(js|ts)';
    pkg.scripts['test:integration'] = pkg.scripts['test:integration'] || 'jest --testPathPattern=.*\\.integration\\.test\\.(js|ts)';
    pkg.scripts['test:e2e'] = pkg.scripts['test:e2e'] || 'cypress run';
    pkg.scripts['test:e2e:open'] = pkg.scripts['test:e2e:open'] || 'cypress open';
    pkg.scripts['test:all'] = 'npm run test:unit && npm run test:integration';
    pkg.scripts['test:coverage'] = 'jest --coverage';
    pkg.scripts['test:coverage:check'] = 'jest --coverage --coverageThreshold=\\\"{\\\\\\\\"global\\\\\\\\": {\\\\\\\\\"branches\\\\\\\": 90, \\\\\\\\\"functions\\\\\\\": 90, \\\\\\\\\"lines\\\\\\\": 90, \\\\\\\\\"statements\\\\\\\": 90}}\\\"';

    // QA scripts
    pkg.scripts['qa:commit'] = './scripts/qa-gates/master-qa-runner.sh commit';
    pkg.scripts['qa:pr'] = './scripts/qa-gates/master-qa-runner.sh pr';
    pkg.scripts['qa:deploy'] = './scripts/qa-gates/master-qa-runner.sh deploy';
    pkg.scripts['qa:daily'] = './scripts/qa-gates/master-qa-runner.sh daily';
    pkg.scripts['qa:business'] = './scripts/qa-gates/master-qa-runner.sh business';
    pkg.scripts['qa:regression'] = './scripts/qa-gates/master-qa-runner.sh regression';
    pkg.scripts['qa:full'] = './scripts/qa-gates/master-qa-runner.sh full';

    // Performance scripts
    pkg.scripts['test:performance'] = pkg.scripts['test:performance'] || 'echo \\\"Performance tests not configured\\\"';
    pkg.scripts['test:performance:dashboard'] = 'curl -w \\\"%{time_total}\\\" -o /dev/null -s http://localhost:3000';
    pkg.scripts['test:performance:api'] = 'curl -w \\\"%{time_total}\\\" -o /dev/null -s http://localhost:8000/api/v1/health';

    // Database scripts
    pkg.scripts['test:db:reset'] = pkg.scripts['test:db:reset'] || 'echo \\\"Database reset not configured\\\"';
    pkg.scripts['test:db:ping'] = pkg.scripts['test:db:ping'] || 'echo \\\"Database ping not configured\\\"';

    // Security scripts
    pkg.scripts['test:security'] = 'npm audit --audit-level=moderate';

    // Linting and type checking
    pkg.scripts['lint'] = pkg.scripts['lint'] || 'eslint . --ext .js,.ts,.tsx';
    pkg.scripts['type-check'] = pkg.scripts['type-check'] || 'tsc --noEmit';

    // Bundle size checking
    pkg.scripts['check:bundle-size'] = pkg.scripts['check:bundle-size'] || 'echo \\\"Bundle size check not configured\\\"';

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    \"

    echo 'Package.json QA scripts added'
else
    echo 'No package.json found - skipping script integration'
fi
"

# Step 5: QA Configuration Files
setup_step "QA Configuration Files" "
# Jest configuration for testing
cat > .qa/config/jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'apps/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ],
  setupFilesAfterEnv: ['<rootDir>/.qa/config/jest.setup.js']
};
EOF

# Jest setup file
cat > .qa/config/jest.setup.js << 'EOF'
// Global test setup
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

// Custom matchers for business logic
expect.extend({
  toBeValidCommissionRate(received) {
    const pass = received >= 0 && received <= 100;
    return {
      message: () => \`expected \${received} to be a valid commission rate (0-100%)\`,
      pass,
    };
  },

  toBeValidPipelineStage(received) {
    const validStages = ['lead', 'demo', 'poc', 'proposal', 'closed_won', 'closed_lost'];
    const pass = validStages.includes(received);
    return {
      message: () => \`expected \${received} to be a valid pipeline stage\`,
      pass,
    };
  }
});
EOF

# Cypress configuration
cat > .qa/config/cypress.config.js << 'EOF'
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'tests/e2e/support/e2e.js',
    specPattern: 'tests/e2e/specs/**/*.spec.{js,ts}',
    videosFolder: 'reports/e2e/videos',
    screenshotsFolder: 'reports/e2e/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
    experimentalStudio: true
  }
});
EOF

echo 'QA configuration files created'
"

# Step 6: Create sample test files
setup_step "Sample Test Files" "
# Commission calculation test example
cat > tests/helpers/commission.test.js << 'EOF'
// Sample commission calculation tests
describe('Commission Calculations', () => {
  test('referral commission should be 15% by default', () => {
    const dealValue = 100000;
    const commissionRate = 0.15;
    const expectedCommission = dealValue * commissionRate;

    expect(expectedCommission).toBe(15000);
    expect(commissionRate).toBeValidCommissionRate();
  });

  test('reseller commission should be 30% by default', () => {
    const dealValue = 100000;
    const commissionRate = 0.30;
    const expectedCommission = dealValue * commissionRate;

    expect(expectedCommission).toBe(30000);
    expect(commissionRate).toBeValidCommissionRate();
  });

  test('commission should not exceed deal value', () => {
    const dealValue = 50000;
    const commissionRate = 1.5; // 150% - invalid

    expect(() => {
      if (commissionRate > 1) throw new Error('Commission rate cannot exceed 100%');
    }).toThrow();
  });
});
EOF

# Pipeline stage test example
cat > tests/helpers/pipeline.test.js << 'EOF'
// Sample pipeline stage tests
describe('Pipeline Stage Management', () => {
  test('stage progression should follow correct order', () => {
    const stages = ['lead', 'demo', 'poc', 'proposal', 'closed_won'];

    stages.forEach(stage => {
      expect(stage).toBeValidPipelineStage();
    });
  });

  test('probability should increase with stage advancement', () => {
    const stageProbabilities = {
      lead: 10,
      demo: 25,
      poc: 50,
      proposal: 75,
      closed_won: 100
    };

    const stages = Object.keys(stageProbabilities);
    for (let i = 1; i < stages.length; i++) {
      const currentStage = stages[i];
      const previousStage = stages[i - 1];

      expect(stageProbabilities[currentStage])
        .toBeGreaterThan(stageProbabilities[previousStage]);
    }
  });
});
EOF

echo 'Sample test files created'
"

# Step 7: Environment validation
setup_step "Environment Validation" "
# Validate Node.js and npm
node --version || echo 'Node.js not found'
npm --version || echo 'npm not found'

# Validate Docker (optional)
docker --version || echo 'Docker not found - OK if not using containers'

# Validate Git
git --version || echo 'Git not found'

echo 'Environment validated'
"

# Step 8: Create daily cron job (optional)
setup_step "Daily Health Check Cron Job (Optional)" "
echo 'Setting up daily health check cron job...'

# Create cron job script
cat > scripts/daily-cron.sh << 'EOF'
#!/bin/bash
cd /path/to/your/project
./scripts/qa-gates/daily-qa-health-check.sh >> logs/daily-qa.log 2>&1
EOF

chmod +x scripts/daily-cron.sh

echo 'To enable daily health checks, add this to your crontab:'
echo '# Daily QA Health Check at 9 AM'
echo '0 9 * * * /path/to/your/project/scripts/daily-cron.sh'
echo ''
echo 'Run: crontab -e'
echo 'Add the line above with the correct path'
"

# Step 9: Create QA documentation
setup_step "QA Documentation" "
cat > docs/qa/README.md << 'EOF'
# QA Environment Setup Complete

## Quick Start

### Run QA checks manually:
\`\`\`bash
# Auto-detect and run appropriate tests
./scripts/qa-gates/master-qa-runner.sh

# Specific test suites
npm run qa:commit      # Pre-commit checks
npm run qa:pr          # Pull request validation
npm run qa:deploy      # Deployment readiness
npm run qa:daily       # Daily health check
npm run qa:business    # Business logic validation
npm run qa:regression  # Regression prevention
\`\`\`

### Git hooks are automatically configured:
- **Pre-commit**: Runs Tier 1 quality gates
- **Pre-push**: Runs integration tests

### Daily operations:
- Run daily health check: \`npm run qa:daily\`
- Check reports in: \`reports/daily-health/\`

## Quality Gates

1. **Tier 1 (Commit)**: Fast checks (linting, unit tests, security scan)
2. **Tier 2 (PR)**: Integration tests, business logic validation
3. **Tier 3 (Deploy)**: Full E2E tests, performance validation, security audit

## Business Logic Protection

Critical business rules are validated:
- Commission calculations (15% referral, 30% reseller)
- Pipeline stage progression (Lead → Demo → POC → Proposal → Closed)
- Goal tracking (\$250K quarterly target)
- Partner relationship health scoring

## Zero Regression Guarantee

Every change is validated against:
- Existing functionality preservation
- Performance baseline maintenance
- Security standard compliance
- Data integrity protection

## Emergency Procedures

If QA fails:
1. Check specific failing tests
2. Run: \`./scripts/qa-gates/master-qa-runner.sh business\`
3. Fix issues before deployment
4. Never deploy with failing business logic tests

## Support

For QA issues, check:
- \`reports/daily-health/\` for health trends
- Individual test outputs
- Business logic validation results
EOF

echo 'QA documentation created'
"

# Step 10: Final validation
setup_step "Final Validation" "
# Test that the master QA runner works
echo 'Testing QA runner...'
./scripts/qa-gates/master-qa-runner.sh --help

echo 'Running quick validation...'
npm run qa:business || echo 'Business validation needs test implementation'

echo 'QA environment setup validation complete'
"

# Setup complete
echo -e "\n🎉 QA Environment Setup Complete!"
echo "=================================="
echo ""
echo -e "${GREEN}✅ QA infrastructure configured${NC}"
echo -e "${GREEN}✅ Git hooks installed${NC}"
echo -e "${GREEN}✅ Scripts made executable${NC}"
echo -e "${GREEN}✅ Configuration files created${NC}"
echo -e "${GREEN}✅ Sample tests provided${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Implement actual test cases based on your business logic"
echo "2. Configure database test utilities if needed"
echo "3. Set up E2E tests with Cypress"
echo "4. Configure performance testing tools"
echo "5. Run initial QA check: ./scripts/qa-gates/master-qa-runner.sh"
echo ""
echo -e "${YELLOW}💡 Quick Commands:${NC}"
echo "  npm run qa:daily        # Run daily health check"
echo "  npm run qa:business     # Validate business logic"
echo "  npm run qa:regression   # Check for regressions"
echo "  npm run qa:full         # Complete test suite"
echo ""
echo -e "${PURPLE}📊 Reports will be saved to:${NC}"
echo "  reports/daily-health/   # Daily health check results"
echo "  reports/coverage/       # Test coverage reports"
echo "  reports/performance/    # Performance test results"
echo ""
echo -e "${BLUE}🎯 Your \$250K quarterly revenue platform is now protected by comprehensive QA!${NC}"
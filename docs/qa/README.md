# QA Environment Setup Complete

## Quick Start

### Run QA checks manually:
```bash
# Auto-detect and run appropriate tests
./scripts/qa-gates/master-qa-runner.sh

# Specific test suites
npm run qa:commit      # Pre-commit checks
npm run qa:pr          # Pull request validation
npm run qa:deploy      # Deployment readiness
npm run qa:daily       # Daily health check
npm run qa:business    # Business logic validation
npm run qa:regression  # Regression prevention
```

### Git hooks are automatically configured:
- **Pre-commit**: Runs Tier 1 quality gates
- **Pre-push**: Runs integration tests

### Daily operations:
- Run daily health check: `npm run qa:daily`
- Check reports in: `reports/daily-health/`

## Quality Gates

1. **Tier 1 (Commit)**: Fast checks (linting, unit tests, security scan)
2. **Tier 2 (PR)**: Integration tests, business logic validation
3. **Tier 3 (Deploy)**: Full E2E tests, performance validation, security audit

## Business Logic Protection

Critical business rules are validated:
- Commission calculations (15% referral, 30% reseller)
- Pipeline stage progression (Lead → Demo → POC → Proposal → Closed)
- Goal tracking ($250K quarterly target)
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
2. Run: `./scripts/qa-gates/master-qa-runner.sh business`
3. Fix issues before deployment
4. Never deploy with failing business logic tests

## Support

For QA issues, check:
- `reports/daily-health/` for health trends
- Individual test outputs
- Business logic validation results

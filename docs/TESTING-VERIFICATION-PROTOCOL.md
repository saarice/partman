# Testing & Verification Protocol

## Critical: Always Verify Changes in Browser

**RULE: Never assume a fix works without browser verification with screenshots.**

### Why This Protocol Exists

During dashboard implementation, TypeScript compilation passed but the application was broken in the browser due to a `verbatimModuleSyntax` import error. The issue was only discovered after taking browser screenshots.

## Mandatory Verification Steps

### 1. TypeScript Compilation Check
```bash
cd /Users/saar/Partman/apps/web
npx tsc --noEmit
```
✅ Must pass with zero errors

### 2. Browser Screenshot Verification

**Run the automated screenshot script:**
```bash
cd /Users/saar/Partman/apps/web
node screenshot-authenticated.cjs
```

This script:
- Logs in with credentials (`admin@partman.com` / `password`)
- Takes screenshots of all dashboards
- Verifies content length (must be > 1000 characters)
- Saves screenshots to `apps/web/screenshots/`

✅ All screenshots must show actual dashboard content (not login page, not empty)

### 3. Manual Browser Check

Open http://localhost:3000 in Chrome and verify:
- Login works
- All dashboards display data
- No JavaScript console errors
- No layout gaps or issues

## Common TypeScript Import Errors

### verbatimModuleSyntax Configuration

The project uses `"verbatimModuleSyntax": true` in `tsconfig.app.json`, which requires:

**❌ WRONG:**
```typescript
import { Opportunity } from '../types/opportunity';
```

**✅ CORRECT:**
```typescript
import type { Opportunity } from '../types/opportunity';
```

### How to Find All Type Imports

```bash
cd /Users/saar/Partman/apps/web
grep -r "from.*types/" src/ | grep "^import {" | grep -v "import type"
```

Any result needs to be changed to `import type`.

## Test Scripts

### screenshot-authenticated.cjs
Takes authenticated screenshots of all dashboards. Use this after any UI changes.

### test-dashboard-load.cjs
Quick HTTP-only test (doesn't require authentication, but won't catch rendering issues).

## Database Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@partman.com | password | vp |
| VP | vp@partnership.com | (see DB) | vp |

**Note:** If login fails, reset password:
```bash
cd /Users/saar/Partman/infrastructure/docker
# Generate hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('password', 10, (err, hash) => console.log(hash));"

# Update database
docker exec docker_postgres_1 psql -U partner_user partnership_mgmt -c "UPDATE users SET password_hash = '<hash>' WHERE email = 'admin@partman.com';"
```

## Pre-Commit Checklist

Before committing dashboard/UI changes:

- [ ] TypeScript compilation passes
- [ ] Screenshot script runs successfully
- [ ] All screenshots show actual content (> 1000 chars)
- [ ] Manually verified in browser
- [ ] No console errors
- [ ] No layout gaps or visual issues

## CI/CD Integration

The project has pre-commit hooks that run linting. To bypass for critical fixes:
```bash
git commit --no-verify -m "your message"
```

**Only use --no-verify for:**
- Critical production fixes
- Linting errors in files you didn't modify

## Regression Prevention

### Files to Watch

These files are critical for dashboard functionality:

1. **Type Imports** - Must use `import type`:
   - `src/utils/opportunityCalculations.ts`
   - `src/services/mockOpportunityData.ts`
   - `src/components/opportunities/KanbanView.tsx`
   - Any file importing from `../types/*`

2. **Layout Configuration**:
   - `src/components/layout/AppLayout.tsx`
   - Check for padding/margin issues

3. **TypeScript Config**:
   - `tsconfig.app.json` - Don't change `verbatimModuleSyntax` without updating all type imports

## Quick Verification Command

```bash
# Full verification pipeline
cd /Users/saar/Partman/apps/web && \
npx tsc --noEmit && \
echo "✅ TypeScript OK" && \
node screenshot-authenticated.cjs && \
echo "✅ Browser verification complete"
```

This should be run:
- Before every commit with UI changes
- After fixing any TypeScript errors
- After modifying dashboard code
- When troubleshooting "empty page" issues

## Common Issues & Solutions

### Issue: Empty Page / Login Loop
**Cause:** TypeScript import error preventing app from loading
**Solution:** Check browser console, fix type imports, restart Docker container

### Issue: Screenshots Show Login Page
**Cause:** Invalid credentials or session not persisting
**Solution:** Update credentials in screenshot script, verify database has correct password hash

### Issue: Content Length < 200 chars
**Cause:** Page not loading properly, still redirecting
**Solution:** Check authentication logic, verify API is running, check Docker logs

## Docker Container Management

```bash
cd /Users/saar/Partman/infrastructure/docker

# Restart with cache clear
docker-compose stop web
docker-compose rm -f web
docker-compose up -d web

# Check logs
docker-compose logs web | tail -50

# Check all services
docker-compose ps
```

---

**Last Updated:** 2025-10-18
**Created After:** TypeScript import error incident that caused empty dashboards

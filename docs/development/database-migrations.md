# Database Migration Guide

## Overview

This project uses a custom migration system to manage database schema changes in a safe, versioned manner.

## Migration System Architecture

- **Migration Files**: Stored in `apps/api/src/migrations/`
- **Tracking Table**: `migrations` table tracks executed migrations
- **Migration Runner**: Custom runner in `apps/api/scripts/run-migrations.ts`
- **Naming Convention**: `NNN_description.sql` (e.g., `001_initial_schema.sql`)

## Available Commands

```bash
# Run pending migrations
npm run migrate --workspace=apps/api

# Check migration status
npm run migrate:status --workspace=apps/api

# Create a new migration
npm run migrate:create <migration_name> --workspace=apps/api

# Seed development data (only in development)
npm run seed:dev --workspace=apps/api

# Reset database and run migrations
npm run db:setup --workspace=apps/api
```

## Creating a New Migration

### Step 1: Generate Migration File

```bash
cd apps/api
npm run migrate:create add_user_preferences
```

This creates: `src/migrations/004_add_user_preferences.sql`

### Step 2: Write Migration SQL

```sql
-- Migration: add_user_preferences
-- Created: 2025-10-18T12:00:00.000Z

-- Up migration
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
CREATE INDEX idx_users_preferences ON users USING GIN(preferences);

-- Down migration (for manual rollback if needed)
-- DROP INDEX idx_users_preferences;
-- ALTER TABLE users DROP COLUMN preferences;
```

### Step 3: Test Migration

```bash
# Test on local database
npm run migrate

# Check status
npm run migrate:status

# Run full test suite
../../scripts/test-migrations.sh
```

## Migration Best Practices

### 1. Always Write Reversible Migrations

```sql
-- ✅ GOOD: Can be rolled back
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;

-- ❌ BAD: Data loss on rollback
ALTER TABLE users DROP COLUMN email;
```

### 2. Use Transactions Implicitly

The migration runner wraps each migration in a transaction. If any statement fails, the entire migration rolls back.

### 3. Include Down Migration Instructions

Always include commented rollback instructions:

```sql
-- Up migration
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false
);

-- Down migration
-- DROP TABLE feature_flags;
```

### 4. Test on Sample Data

Before deploying:
1. Run migration on fresh database
2. Seed development data
3. Verify application still works
4. Test rollback scenario

### 5. Keep Migrations Focused

One migration = One logical change

```bash
# ✅ GOOD
001_create_users_table.sql
002_add_users_indexes.sql
003_add_user_preferences.sql

# ❌ BAD
001_everything.sql
```

## Development Workflow

### Local Development

```bash
# Start fresh
npm run db:reset --workspace=apps/api
npm run migrate --workspace=apps/api
npm run seed:dev --workspace=apps/api

# Start server
npm run dev --workspace=apps/api
```

### Docker Development

Migrations run automatically on container startup:

```bash
docker-compose up
# 1. Waits for PostgreSQL
# 2. Runs migrations
# 3. Seeds development data (if NODE_ENV=development)
# 4. Starts API server
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations tested locally
- [ ] Down migration instructions documented
- [ ] Database backup created
- [ ] Migration tested on staging environment
- [ ] Rollback plan documented

### Deployment Steps

```bash
# 1. Backup production database
pg_dump -h <prod-host> -U <user> -d partnership_mgmt > backup.sql

# 2. Run migrations (in production environment)
NODE_ENV=production npm run migrate --workspace=apps/api

# 3. Verify migration status
npm run migrate:status --workspace=apps/api

# 4. Deploy application code
# ... your deployment process ...
```

### Rollback Procedure

If a migration causes issues:

```bash
# 1. Stop the application

# 2. Manually rollback the migration
# Use the down migration SQL from the migration file
psql -h <prod-host> -U <user> -d partnership_mgmt -c "
  -- Paste down migration SQL here
  DROP INDEX idx_users_preferences;
  ALTER TABLE users DROP COLUMN preferences;
"

# 3. Remove migration from tracking table
psql -h <prod-host> -U <user> -d partnership_mgmt -c "
  DELETE FROM migrations WHERE name = '004_add_user_preferences.sql';
"

# 4. Restore previous application version

# 5. Verify system functionality
```

## Troubleshooting

### Migration Failed Mid-Execution

The runner uses transactions, so partial migrations automatically rollback:

```bash
# Check what was executed
npm run migrate:status --workspace=apps/api

# Fix the migration file
# Re-run
npm run migrate --workspace=apps/api
```

### Migration Already Exists

If you get "migration already executed":

```bash
# Check status
npm run migrate:status --workspace=apps/api

# If incorrectly marked as executed:
psql -d partnership_mgmt -c "DELETE FROM migrations WHERE name = 'XXX_your_migration.sql';"
```

### Schema Drift Between Environments

```bash
# Generate schema snapshot
pg_dump -h localhost -U partner_user -d partnership_mgmt --schema-only > schema.sql

# Compare with other environment
diff schema.sql other-env-schema.sql
```

## Testing Migrations

### Unit Test

```bash
# Run the test script
./scripts/test-migrations.sh
```

The test script:
1. Creates a test database
2. Runs all migrations
3. Verifies schema
4. Tests idempotency
5. Cleans up

### Manual Testing

```bash
# Create test database
createdb partnership_mgmt_test

# Run migrations
DATABASE_URL=postgresql://partner_user:partner_pass@localhost:5432/partnership_mgmt_test \
  npm run migrate --workspace=apps/api

# Inspect
psql partnership_mgmt_test -c "\dt"  # List tables
psql partnership_mgmt_test -c "\d users"  # Describe users table

# Cleanup
dropdb partnership_mgmt_test
```

## Migration History

| Migration | Description | Date | Status |
|-----------|-------------|------|--------|
| 001_create_core_tables.sql | Initial schema (users, partners, opportunities, etc.) | 2024-09-18 | ✅ Executed |
| 002_insert_sample_data.sql | Sample data for development | 2024-09-18 | ⚠️ Deprecated (use seed:dev) |
| 003_add_refresh_tokens.sql | Add refresh token support | 2024-10-11 | ✅ Executed |

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Migration Best Practices](https://www.prisma.io/dataguide/types/relational/migration-strategies)
- [Database Schema Versioning](https://martinfowler.com/articles/evodb.html)

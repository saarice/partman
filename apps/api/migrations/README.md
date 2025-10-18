# Database Migrations

This directory contains database migration files for the Partnership Management Platform.

## Overview

We use SQL-based migrations for schema changes. Each migration file is a plain SQL file with DDL statements.

## Migration Files

- `001_initial_schema.sql` - Initial database schema (users, partners, opportunities, etc.)
- `002_*.sql` - Future migrations...

## Running Migrations

### Prerequisites

Ensure PostgreSQL is running and connection details are configured in `database.json`.

### Apply Migrations

To apply all pending migrations:

```bash
cd apps/api
# TODO: Add migration runner script
npm run migrate:up
```

### Rollback Migrations

To rollback the last migration:

```bash
npm run migrate:down
```

### Create New Migration

To create a new migration:

```bash
npm run migrate:create <migration-name>
```

## Migration Best Practices

1. **Always use IF NOT EXISTS** for CREATE statements
2. **Add indexes** for foreign keys and frequently queried columns
3. **Include comments** to document table purposes
4. **Test rollback** - every migration should have a corresponding down migration
5. **Keep migrations small** - one logical change per migration
6. **Never edit** existing migration files after they've been deployed

## Migration Naming Convention

`NNN_description.sql`

Where:
- `NNN` = Sequential number (001, 002, 003...)
- `description` = Brief description using underscores (e.g., `add_customer_fields`)

## Schema Changes

When adding new features:

1. Create a new migration file
2. Add the SQL DDL statements
3. Test locally
4. Commit the migration file
5. Deploy via CI/CD pipeline

## Troubleshooting

### Migration Failed

If a migration fails:

1. Check the error message
2. Fix the SQL in the migration file
3. Manually rollback if needed:
   ```sql
   DROP TABLE table_name;
   ```
4. Re-run the migration

### Reset Database (Development Only)

To completely reset the database:

```bash
# WARNING: This deletes all data!
docker-compose down -v
docker-compose up -d
npm run migrate:up
```

## Production Considerations

- Migrations run automatically on deployment
- Always backup before running migrations in production
- Test migrations on staging environment first
- Migrations are idempotent (safe to re-run)
- Rolling back in production requires careful planning

## Schema Documentation

See `docs/database-schema.md` for complete schema documentation.

#!/bin/bash
set -e

echo "🧪 Testing database migrations..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database connection
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="partner_user"
DB_PASS="partner_pass"
DB_NAME="partnership_mgmt_test"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "${YELLOW}Step 1: Drop and recreate test database${NC}"
PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d postgres -c "CREATE DATABASE ${DB_NAME};"
echo "${GREEN}✅ Test database created${NC}"
echo ""

echo "${YELLOW}Step 2: Run migrations${NC}"
cd apps/api
DATABASE_URL=${DATABASE_URL} npm run migrate
echo "${GREEN}✅ Migrations executed${NC}"
echo ""

echo "${YELLOW}Step 3: Verify schema${NC}"
echo "Checking tables created..."
PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -c "\dt" | grep -E "users|partners|opportunities|commission_structures|alerts|migrations"
echo "${GREEN}✅ Schema verified${NC}"
echo ""

echo "${YELLOW}Step 4: Check migration status${NC}"
DATABASE_URL=${DATABASE_URL} npm run migrate:status
echo ""

echo "${YELLOW}Step 5: Test idempotency (re-run migrations)${NC}"
DATABASE_URL=${DATABASE_URL} npm run migrate
echo "${GREEN}✅ Migrations are idempotent${NC}"
echo ""

echo "${YELLOW}Step 6: Cleanup test database${NC}"
cd ../..
PGPASSWORD=${DB_PASS} psql -h ${DB_HOST} -U ${DB_USER} -d postgres -c "DROP DATABASE ${DB_NAME};"
echo "${GREEN}✅ Test database cleaned up${NC}"
echo ""

echo "${GREEN}✅ All migration tests passed!${NC}"

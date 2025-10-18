-- Migration: add_customer_fields_to_opportunities
-- Created: 2025-10-18
-- Description: Add customer_id and customer_name fields to opportunities table

-- Up migration
ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS customer_id UUID,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- Add index for customer lookups
CREATE INDEX IF NOT EXISTS idx_opportunities_customer ON opportunities(customer_id);

-- Update existing opportunities to have customer_name from their description if empty
UPDATE opportunities
SET customer_name = 'Unknown Customer'
WHERE customer_name IS NULL;

-- Down migration (for manual rollback if needed)
-- DROP INDEX IF EXISTS idx_opportunities_customer;
-- ALTER TABLE opportunities DROP COLUMN IF EXISTS customer_name;
-- ALTER TABLE opportunities DROP COLUMN IF EXISTS customer_id;

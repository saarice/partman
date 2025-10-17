import { writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createMigration() {
  const migrationName = process.argv[2];

  if (!migrationName) {
    console.error('❌ Error: Migration name is required');
    console.log('Usage: npm run migrate:create <migration_name>');
    console.log('Example: npm run migrate:create add_user_roles');
    process.exit(1);
  }

  const migrationsDir = join(__dirname, '../src/migrations');

  // Get existing migrations to determine next number
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const lastFile = files[files.length - 1];
  const lastNumber = lastFile ? parseInt(lastFile.split('_')[0]) : 0;
  const nextNumber = String(lastNumber + 1).padStart(3, '0');

  const filename = `${nextNumber}_${migrationName}.sql`;
  const filepath = join(migrationsDir, filename);

  const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Up migration
-- Add your schema changes here
-- Example:
-- CREATE TABLE example (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Down migration (for manual rollback if needed)
-- Add rollback instructions in comments
-- Example:
-- DROP TABLE example;
`;

  try {
    writeFileSync(filepath, template, 'utf8');
    console.log(`✅ Migration created: ${filename}`);
    console.log(`📝 Edit the file at: apps/api/src/migrations/${filename}`);
  } catch (error) {
    console.error('❌ Error creating migration:', error);
    process.exit(1);
  }
}

createMigration();

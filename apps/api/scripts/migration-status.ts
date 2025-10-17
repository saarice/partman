import { Pool } from 'pg';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://partner_user:partner_pass@localhost:5432/partnership_mgmt',
});

async function getMigrationStatus() {
  const client = await pool.connect();

  try {
    console.log('📊 Migration Status\n');

    // Check if migrations table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'migrations'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Migrations table does not exist. Run migrations first.');
      return;
    }

    // Get executed migrations
    const result = await client.query('SELECT name, executed_at FROM migrations ORDER BY executed_at');
    const executedMigrations = new Map(result.rows.map(row => [row.name, row.executed_at]));

    // Get available migration files
    const migrationsDir = join(__dirname, '../src/migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration file(s):\n`);

    files.forEach(file => {
      const executedAt = executedMigrations.get(file);
      if (executedAt) {
        console.log(`✅ ${file}`);
        console.log(`   Executed: ${new Date(executedAt).toLocaleString()}`);
      } else {
        console.log(`⏳ ${file}`);
        console.log(`   Status: Pending`);
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`   Total migrations: ${files.length}`);
    console.log(`   Executed: ${executedMigrations.size}`);
    console.log(`   Pending: ${files.length - executedMigrations.size}`);
  } catch (error) {
    console.error('❌ Error getting migration status:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

getMigrationStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/partnership_db',
});

async function resetDatabase() {
  const client = await pool.connect();

  try {
    console.log('🗑️  Dropping all tables...');

    await client.query(`
      DROP TABLE IF EXISTS migrations CASCADE;
      DROP TABLE IF EXISTS opportunity_stage_history CASCADE;
      DROP TABLE IF EXISTS alerts CASCADE;
      DROP TABLE IF EXISTS quarterly_goals CASCADE;
      DROP TABLE IF EXISTS opportunities CASCADE;
      DROP TABLE IF EXISTS partners CASCADE;
      DROP TABLE IF EXISTS refresh_tokens CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS configurations CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    `);

    console.log('✅ Database reset successfully!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();

import { MigrationRunner } from './src/utils/migrationRunner.js';
import { logger } from './src/utils/logger.js';

async function main() {
  const migrationRunner = new MigrationRunner();

  try {
    logger.info('🚀 Starting database migrations...');
    await migrationRunner.runMigrations();

    const status = await migrationRunner.getMigrationStatus();
    logger.info('✅ Migration status:', status);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { query } from './database.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Migration {
  id: string;
  filename: string;
  description: string;
  executed_at?: Date;
}

export class MigrationRunner {
  private migrationsPath: string;

  constructor() {
    this.migrationsPath = join(__dirname, '../migrations');
  }

  async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        description TEXT,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await query(createTableSQL);
      logger.info('Migrations table created or already exists');
    } catch (error) {
      logger.error('Error creating migrations table:', error);
      throw error;
    }
  }

  async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await query('SELECT id FROM migrations ORDER BY executed_at');
      return result.rows.map(row => row.id);
    } catch (error) {
      logger.error('Error getting executed migrations:', error);
      return [];
    }
  }

  async executeMigration(migrationFile: string): Promise<void> {
    const migrationPath = join(this.migrationsPath, migrationFile);

    try {
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      const migrationId = migrationFile.replace(/\.sql$/, '');

      logger.info(`Executing migration: ${migrationFile}`);

      // Execute the migration
      await query(migrationSQL);

      // Record the migration as executed
      await query(
        'INSERT INTO migrations (id, filename, description) VALUES ($1, $2, $3)',
        [migrationId, migrationFile, `Migration from ${migrationFile}`]
      );

      logger.info(`Migration ${migrationFile} executed successfully`);
    } catch (error) {
      logger.error(`Error executing migration ${migrationFile}:`, error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get list of executed migrations
      const executedMigrations = await this.getExecutedMigrations();

      // Define migration files in order
      const migrationFiles = [
        '001_create_core_tables.sql',
        '002_insert_sample_data.sql'
      ];

      for (const migrationFile of migrationFiles) {
        const migrationId = migrationFile.replace(/\.sql$/, '');

        if (!executedMigrations.includes(migrationId)) {
          await this.executeMigration(migrationFile);
        } else {
          logger.info(`Migration ${migrationFile} already executed, skipping`);
        }
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Error running migrations:', error);
      throw error;
    }
  }

  async rollbackMigration(migrationId: string): Promise<void> {
    try {
      await query('DELETE FROM migrations WHERE id = $1', [migrationId]);
      logger.info(`Migration ${migrationId} rolled back`);
    } catch (error) {
      logger.error(`Error rolling back migration ${migrationId}:`, error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<Migration[]> {
    try {
      const result = await query(`
        SELECT id, filename, description, executed_at
        FROM migrations
        ORDER BY executed_at DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting migration status:', error);
      return [];
    }
  }
}
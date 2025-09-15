import { Pool } from 'pg';
import { logger } from './logger.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://partner_user:partner_pass@localhost:5432/partnership_mgmt',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Query error', { text, error: err });
    throw err;
  }
};

export const getClient = async () => {
  return await pool.connect();
};

export default pool;
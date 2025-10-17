import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../src/utils/logger.js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://partner_user:partner_pass@localhost:5432/partnership_mgmt',
});

async function seedDevelopmentData() {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    logger.warn('❌ Cannot run development seed in production environment');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    logger.info('🌱 Seeding development data...');

    // Check if data already exists
    const userCheck = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) > 1) {
      logger.info('✅ Development data already exists, skipping seed');
      return;
    }

    // Insert sample users
    await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
      ('550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@partman.com', '$2b$10$hash', 'Sarah', 'Johnson', 'sales_manager'),
      ('550e8400-e29b-41d4-a716-446655440002', 'mike.chen@partman.com', '$2b$10$hash', 'Mike', 'Chen', 'partnership_manager'),
      ('550e8400-e29b-41d4-a716-446655440003', 'emily.davis@partman.com', '$2b$10$hash', 'Emily', 'Davis', 'team_member')
      ON CONFLICT (email) DO NOTHING
    `);
    logger.info('  ✓ Sample users inserted');

    // Insert sample partners
    await client.query(`
      INSERT INTO partners (id, name, domain, website, primary_contact_name, primary_contact_email, relationship_health_score) VALUES
      ('650e8400-e29b-41d4-a716-446655440001', 'CloudOps Solutions', 'finops', 'https://cloudops.com', 'John Smith', 'john@cloudops.com', 85),
      ('650e8400-e29b-41d4-a716-446655440002', 'SecureIT Pro', 'security', 'https://secureit.com', 'Jane Doe', 'jane@secureit.com', 45),
      ('650e8400-e29b-41d4-a716-446655440003', 'DataFlow Analytics', 'data', 'https://dataflow.com', 'Bob Wilson', 'bob@dataflow.com', 92),
      ('650e8400-e29b-41d4-a716-446655440004', 'DevOps Masters', 'devops', 'https://devopsmasters.com', 'Alice Brown', 'alice@devopsmasters.com', 67),
      ('650e8400-e29b-41d4-a716-446655440005', 'Monitor360', 'observability', 'https://monitor360.com', 'Charlie Green', 'charlie@monitor360.com', 55)
      ON CONFLICT (id) DO NOTHING
    `);
    logger.info('  ✓ Sample partners inserted');

    // Insert sample commission structures
    await client.query(`
      INSERT INTO commission_structures (partner_id, type, percentage, is_default, effective_date) VALUES
      ('650e8400-e29b-41d4-a716-446655440001', 'reseller', 30.00, true, CURRENT_DATE),
      ('650e8400-e29b-41d4-a716-446655440002', 'referral', 15.00, true, CURRENT_DATE),
      ('650e8400-e29b-41d4-a716-446655440003', 'msp', 25.00, true, CURRENT_DATE),
      ('650e8400-e29b-41d4-a716-446655440004', 'reseller', 20.00, true, CURRENT_DATE),
      ('650e8400-e29b-41d4-a716-446655440005', 'referral', 12.00, true, CURRENT_DATE)
      ON CONFLICT DO NOTHING
    `);
    logger.info('  ✓ Sample commission structures inserted');

    // Insert sample opportunities with stagnant and approaching deadlines
    await client.query(`
      INSERT INTO opportunities (id, title, description, customer_id, customer_name, partner_id, assigned_user_id, stage, value, probability, expected_close_date, created_at, updated_at) VALUES
      ('750e8400-e29b-41d4-a716-446655440001', 'Acme Corp Cloud Migration', 'Large-scale cloud migration project', '850e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'demo', 125000, 25, CURRENT_DATE + INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '20 days'),
      ('750e8400-e29b-41d4-a716-446655440002', 'TechStart Security Audit', 'Comprehensive security assessment', '850e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'poc', 85000, 50, CURRENT_DATE + INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '15 days'),
      ('750e8400-e29b-41d4-a716-446655440003', 'Global Analytics Platform', 'Enterprise data analytics solution', '850e8400-e29b-41d4-a716-446655440003', 'Global Enterprises', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'proposal', 250000, 75, CURRENT_DATE + INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
      ('750e8400-e29b-41d4-a716-446655440004', 'DevOps Transformation', 'Complete DevOps pipeline setup', '850e8400-e29b-41d4-a716-446655440004', 'Innovation Labs', '650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'lead', 95000, 10, CURRENT_DATE + INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '35 days', CURRENT_TIMESTAMP - INTERVAL '35 days')
      ON CONFLICT (id) DO NOTHING
    `);
    logger.info('  ✓ Sample opportunities inserted');

    // Insert sample alerts
    await client.query(`
      INSERT INTO alerts (user_id, type, priority, title, message, entity_id) VALUES
      ('550e8400-e29b-41d4-a716-446655440000', 'opportunity', 'high', 'TechStart Security Audit closing tomorrow', 'Expected close date is in 1 day. Value: $85,000', '750e8400-e29b-41d4-a716-446655440002'),
      ('550e8400-e29b-41d4-a716-446655440000', 'opportunity', 'medium', 'Acme Corp Cloud Migration is stagnant', 'This opportunity has been in demo stage for 20 days without updates.', '750e8400-e29b-41d4-a716-446655440001'),
      ('550e8400-e29b-41d4-a716-446655440000', 'partner', 'high', 'SecureIT Pro needs attention', 'Health score: 45/100. Last updated 15 days ago.', '650e8400-e29b-41d4-a716-446655440002'),
      ('550e8400-e29b-41d4-a716-446655440000', 'goal', 'medium', 'Quarterly goal progress update', 'Currently at 75% of quarterly target with 3 weeks remaining. On track for goal achievement.', null),
      ('550e8400-e29b-41d4-a716-446655440000', 'partner', 'medium', 'Monitor360 relationship maintenance', 'Health score: 55/100. Consider scheduling check-in meeting.', '650e8400-e29b-41d4-a716-446655440005'),
      ('550e8400-e29b-41d4-a716-446655440001', 'opportunity', 'urgent', 'DevOps Transformation extremely stagnant', 'This opportunity has been in lead stage for 35 days without updates.', '750e8400-e29b-41d4-a716-446655440004')
      ON CONFLICT (id) DO NOTHING
    `);
    logger.info('  ✓ Sample alerts inserted');

    logger.info('✅ Development data seeded successfully!');
  } catch (error) {
    logger.error('❌ Failed to seed development data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
seedDevelopmentData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

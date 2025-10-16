import bcrypt from 'bcrypt';
import { query } from '../src/utils/database.js';

async function createTestUser() {
  try {
    const email = 'admin@partman.com';
    const password = 'Admin123!';
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.log('User already exists. Updating password...');
      await query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, email]
      );
      console.log('✅ Password updated for', email);
    } else {
      console.log('Creating new user...');
      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [email, passwordHash, 'Admin', 'User', 'vp']
      );
      console.log('✅ User created:', email);
    }

    console.log('\nTest Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestUser();

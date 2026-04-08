const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function setupAdmin() {
  const email = 'admin@leadsphere.com';
  const password = 'Admin123!';
  const name = 'Super Admin';
  const role = 'superadmin';

  try {
    console.log(`Setting up Super Admin: ${email}`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows: existing } = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.length === 0) {
      console.log('User does not exist, creating new Super Admin...');
      const { rows: newUser } = await db.query(
        'INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, role, hashedPassword]
      );
      
      // Make them their own admin_id for site root logic
      await db.query('UPDATE users SET admin_id = id WHERE id = $1', [newUser[0].id]);
      console.log('SUCCESS: New Super Admin created.');
    } else {
      console.log('User already exists, updating role and resetting password...');
      await db.query(
        'UPDATE users SET role = $1, password = $2, admin_id = id WHERE email = $3',
        [role, hashedPassword, email]
      );
      console.log('SUCCESS: Super Admin account updated/reset.');
    }

    process.exit(0);
  } catch (err) {
    console.error('ERROR: Failed to setup admin account:', err);
    process.exit(1);
  }
}

setupAdmin();

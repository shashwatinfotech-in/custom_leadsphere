const db = require('./config/db');

async function fixData() {
  try {
    console.log('Fixing data integrity...');

    // 1. Give every user an admin_id if they don't have one (self-referential for admins/superadmins)
    // For regular users, we'll just make them their own root for now or link them to the first admin.
    console.log('Fixing user admin_id values...');
    await db.query(`
       UPDATE users 
       SET admin_id = id 
       WHERE admin_id IS NULL AND (role = 'admin' OR role = 'superadmin' OR role = 'user')
    `);

    // 2. Give every lead an admin_id from the user who created it
    console.log('Fixing lead admin_id values...');
    await db.query(`
      UPDATE leads l
      SET admin_id = u.admin_id
      FROM users u
      WHERE l.created_by = u.id AND l.admin_id IS NULL
    `);

    console.log('Data fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to fix data:', err);
    process.exit(1);
  }
}

fixData();

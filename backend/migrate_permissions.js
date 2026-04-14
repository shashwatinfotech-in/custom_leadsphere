const db = require('./config/db');

const allPermissions = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: true,
  userManagement: true,
  configuration: true
};

const managerPermissions = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: true,
  userManagement: false,
  configuration: true
};

const userPermissions = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: false,
  userManagement: false,
  configuration: false
};

async function migratePermissions() {
  try {
    console.log('Adding permissions column to users table...');

    const { rows } = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'permissions'
    `);

    if (rows.length === 0) {
      await db.query(`
        ALTER TABLE users
        ADD COLUMN permissions JSONB NOT NULL DEFAULT '{}'::jsonb
      `);
      console.log('permissions column added.');
    } else {
      console.log('permissions column already exists.');
    }

    console.log('Backfilling existing user permissions...');
    await db.query(
      `UPDATE users
       SET permissions = CASE
         WHEN role IN ('admin', 'superadmin', 'super_admin') THEN $1::jsonb
         WHEN role = 'manager' THEN $2::jsonb
         ELSE $3::jsonb
       END
       WHERE permissions = '{}'::jsonb OR permissions IS NULL`,
      [JSON.stringify(allPermissions), JSON.stringify(managerPermissions), JSON.stringify(userPermissions)]
    );

    console.log('Permissions migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('Permissions migration failed:', err);
    process.exit(1);
  }
}

migratePermissions();

const crypto = require('crypto');
const db = require('./config/db');

const seedRoles = [
  {
    key: 'superadmin',
    label: 'Super Admin',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: true,
      configuration: true
    },
    is_system: true
  },
  {
    key: 'admin',
    label: 'Manager',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: true,
      configuration: true
    },
    is_system: true
  },
  {
    key: 'manager',
    label: 'Team Manager',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: false,
      configuration: true
    },
    is_system: true
  },
  {
    key: 'user',
    label: 'Sales Executive',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: false,
      userManagement: false,
      configuration: false
    },
    is_system: true
  }
];

async function migrateRoles() {
  try {
    console.log('Creating roles table if it does not exist...');

    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY,
        key VARCHAR(120) UNIQUE NOT NULL,
        label VARCHAR(120) NOT NULL,
        permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_by UUID REFERENCES users(id),
        is_system BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    for (const role of seedRoles) {
      const { rows } = await db.query('SELECT id FROM roles WHERE key = $1', [role.key]);
      if (rows.length === 0) {
        await db.query(
          `INSERT INTO roles (id, key, label, permissions, is_system)
           VALUES ($1, $2, $3, $4::jsonb, $5)`,
          [crypto.randomUUID(), role.key, role.label, JSON.stringify(role.permissions), role.is_system]
        );
        console.log(`Seeded role: ${role.key}`);
      }
    }

    console.log('Role migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Role migration failed:', err);
    process.exit(1);
  }
}

migrateRoles();

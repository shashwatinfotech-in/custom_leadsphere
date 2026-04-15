const db = require('./config/db');

const defaultRoles = [
  {
    name: 'superadmin',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: true,
      configuration: true
    }
  },
  {
    name: 'company_admin',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: true,
      configuration: true
    }
  },
  {
    name: 'manager',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: false,
      configuration: true
    }
  },
  {
    name: 'user',
    permissions: {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: false,
      userManagement: false,
      configuration: false
    }
  }
];

const toName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, '_');

async function migrateRoles() {
  try {
    console.log('Ensuring roles table uses the new integer schema...');

    const { rows: roleColumns } = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'roles'
    `);

    const hasLegacyShape = roleColumns.some((row) => row.column_name === 'key' || row.column_name === 'label' || row.data_type === 'uuid');

    const { rows: legacyExists } = await db.query(`
      SELECT to_regclass('public.roles_legacy') AS exists
    `);

    if (hasLegacyShape && !legacyExists[0].exists) {
      await db.query('ALTER TABLE roles RENAME TO roles_legacy');
      console.log('Renamed legacy roles table to roles_legacy.');
    }

    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const role of defaultRoles) {
      await db.query(
        `INSERT INTO roles (name, permissions)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (name) DO NOTHING`,
        [role.name, JSON.stringify(role.permissions)]
      );
    }

    const { rows: legacyTableExists } = await db.query(`
      SELECT to_regclass('public.roles_legacy') AS exists
    `);

    if (legacyTableExists[0].exists) {
      const { rows: legacyRoles } = await db.query(`
        SELECT key, label, permissions, is_system
        FROM roles_legacy
      `);

      for (const role of legacyRoles) {
        const name = toName(role.key || role.label);
        await db.query(
          `INSERT INTO roles (name, is_active, permissions)
           VALUES ($1, TRUE, $2::jsonb)
           ON CONFLICT (name) DO UPDATE
             SET permissions = COALESCE(EXCLUDED.permissions, roles.permissions)`,
          [name, JSON.stringify(role.permissions || {})]
        );
      }
    }

    const { rows: userColumns } = await db.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
    `);

    const hasRoleId = userColumns.some((row) => row.column_name === 'role_id');
    if (!hasRoleId) {
      await db.query(`ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id)`);
      console.log('Added role_id column to users.');
    }

    await db.query(`
      UPDATE users u
      SET role_id = r.id,
          role = COALESCE(r.name, u.role)
      FROM roles r
      WHERE u.role_id IS NULL
        AND LOWER(COALESCE(u.role, '')) = LOWER(r.name)
    `);

    await db.query(`
      UPDATE users u
      SET role_id = r.id,
          role = COALESCE(r.name, u.role)
      FROM roles_legacy rl
      JOIN roles r ON LOWER(r.name) = LOWER(COALESCE(rl.key, rl.label))
      WHERE u.role_id IS NULL
        AND LOWER(COALESCE(u.role, '')) = LOWER(COALESCE(rl.key, rl.label))
    `).catch(() => {});

    console.log('Role migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Role migration failed:', err);
    process.exit(1);
  }
}

migrateRoles();

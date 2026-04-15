const db = require('../config/db');

const Role = {
  findAll: async ({ includeInactive = true } = {}) => {
    const { rows } = await db.query(`
      SELECT id, name, is_active, permissions, created_at
      FROM roles
      ${includeInactive ? '' : 'WHERE is_active = TRUE'}
      ORDER BY name ASC
    `);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query(
      'SELECT id, name, is_active, permissions, created_at FROM roles WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  findByName: async (name) => {
    const { rows } = await db.query(
      'SELECT id, name, is_active, permissions, created_at FROM roles WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    return rows[0];
  },

  create: async ({ name, is_active = true, permissions = {} }) => {
    const { rows } = await db.query(
      `INSERT INTO roles (name, is_active, permissions)
       VALUES ($1, $2, $3::jsonb)
       RETURNING id, name, is_active, permissions, created_at`,
      [name, is_active, JSON.stringify(permissions || {})]
    );
    return rows[0];
  },

  update: async (id, { name, is_active, permissions }) => {
    const { rows } = await db.query(
      `UPDATE roles
       SET name = COALESCE($1, name),
           is_active = COALESCE($2, is_active),
           permissions = COALESCE($3::jsonb, permissions)
       WHERE id = $4
       RETURNING id, name, is_active, permissions, created_at`,
      [name, is_active, permissions !== undefined ? JSON.stringify(permissions) : null, id]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  }
};

module.exports = Role;

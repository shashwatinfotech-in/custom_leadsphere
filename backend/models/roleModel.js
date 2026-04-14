const crypto = require('crypto');
const db = require('../config/db');

const Role = {
  create: async ({ key, label, permissions, created_by, is_system = false }) => {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO roles (id, key, label, permissions, created_by, is_system)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      id,
      key,
      label,
      JSON.stringify(permissions || {}),
      created_by || null,
      is_system
    ]);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await db.query(
      'SELECT * FROM roles ORDER BY is_system DESC, label ASC, created_at ASC'
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
    return rows[0];
  },

  findByKey: async (key) => {
    const { rows } = await db.query('SELECT * FROM roles WHERE key = $1', [key]);
    return rows[0];
  },

  findByLabel: async (label) => {
    const { rows } = await db.query('SELECT * FROM roles WHERE lower(label) = lower($1)', [label]);
    return rows[0];
  },

  update: async (id, { label, permissions }) => {
    const query = `
      UPDATE roles
      SET label = COALESCE($1, label),
          permissions = COALESCE($2::jsonb, permissions)
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      label,
      permissions ? JSON.stringify(permissions) : null,
      id
    ]);
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  }
};

module.exports = Role;

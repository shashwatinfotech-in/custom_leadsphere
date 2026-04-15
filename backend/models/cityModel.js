const db = require('../config/db');

const City = {
  findAll: async ({ includeInactive = true } = {}) => {
    const query = `
      SELECT id, name, is_active, created_at
      FROM cities
      ${includeInactive ? '' : 'WHERE is_active = TRUE'}
      ORDER BY name ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query(
      'SELECT id, name, is_active, created_at FROM cities WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  findByName: async (name) => {
    const { rows } = await db.query(
      'SELECT id, name, is_active, created_at FROM cities WHERE lower(name) = lower($1)',
      [name]
    );
    return rows[0];
  },

  create: async ({ name, is_active = true }) => {
    const { rows } = await db.query(
      `INSERT INTO cities (name, is_active)
       VALUES ($1, $2)
       RETURNING id, name, is_active, created_at`,
      [name, is_active]
    );
    return rows[0];
  },

  update: async (id, { name, is_active }) => {
    const { rows } = await db.query(
      `UPDATE cities
       SET name = COALESCE($1, name),
           is_active = COALESCE($2, is_active)
       WHERE id = $3
       RETURNING id, name, is_active, created_at`,
      [name, is_active, id]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM cities WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  }
};

module.exports = City;

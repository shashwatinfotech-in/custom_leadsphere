const db = require('../config/db');

const User = {
  create: async ({ company_id, name, email, phone, role, password }) => {
    const query = `
      INSERT INTO users (company_id, name, email, phone, role, password)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, company_id, name, email, phone, role, status, created_at
    `;
    const { rows } = await db.query(query, [
      company_id, name, email, phone || null, role || 'user', password
    ]);
    return rows[0];
  },

  findByEmail: async (email) => {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await db.query(
      'SELECT id, company_id, name, email, phone, role, status, last_login, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  findAll: async (company_id) => {
    const { rows } = await db.query(
      `SELECT id, company_id, name, email, phone, role, status, last_login, created_at
       FROM users
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [company_id]
    );
    return rows;
  },

  update: async (id, data) => {
    const { name, email, phone, role, status } = data;
    const query = `
      UPDATE users
      SET name   = COALESCE($1, name),
          email  = COALESCE($2, email),
          phone  = COALESCE($3, phone),
          role   = COALESCE($4, role),
          status = COALESCE($5, status)
      WHERE id = $6
      RETURNING id, company_id, name, email, phone, role, status, last_login, created_at
    `;
    const { rows } = await db.query(query, [name, email, phone, role, status, id]);
    return rows[0];
  },

  updateLastLogin: async (id) => {
    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  }
};

module.exports = User;

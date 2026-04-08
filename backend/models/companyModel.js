const db = require('../config/db');

const Company = {
  create: async ({ name, email, phone }) => {
    const query = `
      INSERT INTO companies (name, email, phone)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, email || null, phone || null]);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await db.query('SELECT * FROM companies ORDER BY created_at DESC');
    return rows;
  },

  update: async (id, data) => {
    const { name, email, phone, address, logo_url, is_active, settings } = data;
    const query = `
      UPDATE companies
      SET name      = COALESCE($1, name),
          email     = COALESCE($2, email),
          phone     = COALESCE($3, phone),
          address   = COALESCE($4, address),
          logo_url  = COALESCE($5, logo_url),
          is_active = COALESCE($6, is_active),
          settings  = COALESCE($7, settings)
      WHERE id = $8
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, email, phone, address, logo_url, is_active, settings, id]);
    return rows[0];
  }
};

module.exports = Company;

const db = require('../config/db');

const CustomField = {
  create: async ({ company_id, field_name, field_type, options }) => {
    const query = `
      INSERT INTO lead_custom_fields (company_id, field_name, field_type, options)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      company_id, field_name, field_type, options ? JSON.stringify(options) : null
    ]);
    return rows[0];
  },

  findAll: async (company_id) => {
    const { rows } = await db.query(
      'SELECT * FROM lead_custom_fields WHERE company_id = $1 ORDER BY created_at ASC',
      [company_id]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM lead_custom_fields WHERE id = $1', [id]);
    return rows[0];
  },

  update: async (id, { field_name, field_type, options }) => {
    const query = `
      UPDATE lead_custom_fields
      SET field_name = COALESCE($1, field_name),
          field_type = COALESCE($2, field_type),
          options    = COALESCE($3, options)
      WHERE id = $4
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      field_name, field_type, options ? JSON.stringify(options) : null, id
    ]);
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query(
      'DELETE FROM lead_custom_fields WHERE id = $1 RETURNING id', [id]
    );
    return rows[0];
  }
};

module.exports = CustomField;

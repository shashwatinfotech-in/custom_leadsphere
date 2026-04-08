const db = require('../config/db');

const Import = {
  create: async ({ company_id, file_name, imported_by, total_records }) => {
    const query = `
      INSERT INTO imports (company_id, file_name, imported_by, total_records)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await db.query(query, [company_id, file_name, imported_by, total_records]);
    return rows[0];
  },

  findAll: async (company_id) => {
    const query = `
      SELECT i.*,
             u.name AS imported_by_name
      FROM imports i
      LEFT JOIN users u ON i.imported_by = u.id
      WHERE i.company_id = $1
      ORDER BY i.created_at DESC
    `;
    const { rows } = await db.query(query, [company_id]);
    return rows;
  }
};

module.exports = Import;

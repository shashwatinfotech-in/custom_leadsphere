const db = require('../config/db');

const Email = {
  create: async ({ company_id, lead_id, template_id, subject, message, sent_by }) => {
    const query = `
      INSERT INTO emails (company_id, lead_id, template_id, subject, message, status, sent_by)
      VALUES ($1, $2, $3, $4, $5, 'sent', $6)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      company_id, lead_id || null, template_id || null, subject, message, sent_by
    ]);
    return rows[0];
  },

  findAll: async (company_id, filters = {}) => {
    let query = `
      SELECT e.*,
             l.name  AS lead_name,
             l.email AS lead_email,
             u.name  AS sent_by_name
      FROM emails e
      LEFT JOIN leads l ON e.lead_id = l.id
      LEFT JOIN users u ON e.sent_by = u.id
      WHERE e.company_id = $1
    `;
    const values = [company_id];
    let idx = 2;

    if (filters.lead_id) {
      query += ` AND e.lead_id = $${idx++}`;
      values.push(filters.lead_id);
    }

    query += ' ORDER BY e.sent_at DESC';
    const { rows } = await db.query(query, values);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM emails WHERE id = $1', [id]);
    return rows[0];
  }
};

module.exports = Email;

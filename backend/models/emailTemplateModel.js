const db = require('../config/db');

const EmailTemplate = {
  create: async ({ company_id, template_name, subject, body, created_by }) => {
    const query = `
      INSERT INTO email_templates (company_id, template_name, subject, body, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await db.query(query, [company_id, template_name, subject, body, created_by]);
    return rows[0];
  },

  findAll: async (company_id) => {
    const { rows } = await db.query(
      'SELECT * FROM email_templates WHERE company_id = $1 ORDER BY created_at DESC',
      [company_id]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM email_templates WHERE id = $1', [id]);
    return rows[0];
  },

  update: async (id, { template_name, subject, body }) => {
    const query = `
      UPDATE email_templates
      SET template_name = COALESCE($1, template_name),
          subject       = COALESCE($2, subject),
          body          = COALESCE($3, body)
      WHERE id = $4
      RETURNING *
    `;
    const { rows } = await db.query(query, [template_name, subject, body, id]);
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query(
      'DELETE FROM email_templates WHERE id = $1 RETURNING id', [id]
    );
    return rows[0];
  }
};

module.exports = EmailTemplate;

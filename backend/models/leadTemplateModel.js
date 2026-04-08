const db = require('../config/db');

const LeadTemplate = {
  create: async ({ company_id, name, description, fields }) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'INSERT INTO lead_templates (company_id, name, description) VALUES ($1, $2, $3) RETURNING *',
        [company_id, name, description || null]
      );
      const template = rows[0];

      if (fields && fields.length > 0) {
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          await client.query(
            `INSERT INTO lead_template_fields
               (template_id, label, field_type, required, default_value, options, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              template.id,
              f.label,
              f.type || f.field_type,
              f.required || false,
              f.defaultValue || f.default_value || null,
              f.options ? JSON.stringify(f.options) : null,
              i
            ]
          );
        }
      }
      await client.query('COMMIT');
      return template;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  findAll: async (company_id) => {
    const { rows } = await db.query(
      'SELECT * FROM lead_templates WHERE company_id = $1 AND is_active = TRUE ORDER BY created_at DESC',
      [company_id]
    );
    const withFields = await Promise.all(rows.map(async (tpl) => {
      const { rows: fields } = await db.query(
        'SELECT * FROM lead_template_fields WHERE template_id = $1 ORDER BY display_order ASC',
        [tpl.id]
      );
      return { ...tpl, fields };
    }));
    return withFields;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM lead_templates WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const { rows: fields } = await db.query(
      'SELECT * FROM lead_template_fields WHERE template_id = $1 ORDER BY display_order ASC', [id]
    );
    rows[0].fields = fields;
    return rows[0];
  },

  update: async (id, { name, description, fields }) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE lead_templates SET name = $1, description = $2 WHERE id = $3',
        [name, description || null, id]
      );
      await client.query('DELETE FROM lead_template_fields WHERE template_id = $1', [id]);
      if (fields && fields.length > 0) {
        for (let i = 0; i < fields.length; i++) {
          const f = fields[i];
          await client.query(
            `INSERT INTO lead_template_fields
               (template_id, label, field_type, required, default_value, options, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              id,
              f.label,
              f.type || f.field_type,
              f.required || false,
              f.defaultValue || f.default_value || null,
              f.options ? JSON.stringify(f.options) : null,
              i
            ]
          );
        }
      }
      await client.query('COMMIT');
      return await LeadTemplate.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  delete: async (id) => {
    await db.query('DELETE FROM lead_templates WHERE id = $1', [id]);
  }
};

module.exports = LeadTemplate;

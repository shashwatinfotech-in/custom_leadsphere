const db = require('../config/db');

const Lead = {
  create: async (leadData) => {
    const {
      company_id,
      name,
      email,
      phone,
      company,
      source,
      status,
      assigned_to,
      created_by,
      notes,
      city_id
    } = leadData;

    const query = `
      INSERT INTO leads (company_id, name, email, phone, company, source, status, assigned_to, created_by, notes, city_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;
    const values = [
      company_id,
      name,
      email || null,
      phone || null,
      company || null,
      source || null,
      status || 'New',
      assigned_to || null,
      created_by,
      notes || null,
      city_id || null
    ];
    const { rows } = await db.query(query, values);
    return Lead.findById(rows[0].id);
  },

  findAll: async (filters = {}, userId, role, companyId) => {
    let query = `
      SELECT l.*,
             u1.name AS assigned_to_name,
             u2.name AS created_by_name,
             c.name AS city_name
      FROM leads l
      LEFT JOIN users u1 ON l.assigned_to = u1.id
      LEFT JOIN users u2 ON l.created_by = u2.id
      LEFT JOIN cities c ON l.city_id = c.id
      WHERE l.company_id = $1
    `;
    const values = [companyId];
    let idx = 2;

    if (String(role || '').toLowerCase() === 'user') {
      query += ` AND (l.assigned_to = $${idx} OR l.created_by = $${idx + 1})`;
      values.push(userId, userId);
      idx += 2;
    }

    if (filters.status) {
      query += ` AND l.status = $${idx++}`;
      values.push(filters.status);
    }
    if (filters.source) {
      query += ` AND l.source = $${idx++}`;
      values.push(filters.source);
    }
    if (filters.assigned_to) {
      query += ` AND l.assigned_to = $${idx++}`;
      values.push(filters.assigned_to);
    }
    if (filters.city_id !== undefined && filters.city_id !== null && filters.city_id !== '') {
      query += ` AND l.city_id = $${idx++}`;
      values.push(filters.city_id);
    }

    query += ' ORDER BY l.created_at DESC';
    const { rows } = await db.query(query, values);
    return rows;
  },

  findById: async (id) => {
    const query = `
      SELECT l.*,
             u1.name AS assigned_to_name,
             u2.name AS created_by_name,
             c.name AS city_name
      FROM leads l
      LEFT JOIN users u1 ON l.assigned_to = u1.id
      LEFT JOIN users u2 ON l.created_by = u2.id
      LEFT JOIN cities c ON l.city_id = c.id
      WHERE l.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    if (!rows[0]) return null;

    const cvQuery = `
      SELECT cf.field_name, cf.field_type, cv.value, cf.id AS field_id
      FROM lead_custom_values cv
      JOIN lead_custom_fields cf ON cv.field_id = cf.id
      WHERE cv.lead_id = $1
    `;
    const { rows: cv } = await db.query(cvQuery, [id]);
    rows[0].custom_fields = cv;
    return rows[0];
  },

  update: async (id, leadData) => {
    const { name, email, phone, company, source, status, assigned_to, notes, city_id } = leadData;
    const query = `
      UPDATE leads
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          company = COALESCE($4, company),
          source = COALESCE($5, source),
          status = COALESCE($6, status),
          assigned_to = $7,
          notes = COALESCE($8, notes),
          city_id = COALESCE($9, city_id),
          updated_at = NOW()
      WHERE id = $10
      RETURNING id
    `;
    const { rows } = await db.query(query, [
      name,
      email,
      phone,
      company,
      source,
      status,
      assigned_to || null,
      notes,
      city_id !== undefined ? city_id : null,
      id
    ]);
    return rows[0] ? Lead.findById(rows[0].id) : null;
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM leads WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  },

  updateStatus: async (leadId, newStatus, changedBy, oldStatus) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        'UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newStatus, leadId]
      );
      await client.query(
        'INSERT INTO lead_status_history (lead_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)',
        [leadId, oldStatus, newStatus, changedBy]
      );
      await client.query(
        'INSERT INTO lead_activity_logs (lead_id, activity, created_by) VALUES ($1, $2, $3)',
        [leadId, `Status changed from "${oldStatus}" to "${newStatus}"`, changedBy]
      );
      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  setCustomValue: async (leadId, fieldId, value) => {
    const query = `
      INSERT INTO lead_custom_values (lead_id, field_id, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (lead_id, field_id) DO UPDATE SET value = EXCLUDED.value
      RETURNING *
    `;
    const { rows } = await db.query(query, [leadId, fieldId, value]);
    return rows[0];
  }
};

module.exports = Lead;

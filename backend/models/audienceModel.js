const db = require('../config/db');

const Audience = {
  create: async ({ company_id, name, description, created_by }) => {
    const query = `
      INSERT INTO audiences (company_id, name, description, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await db.query(query, [company_id, name, description || null, created_by]);
    return rows[0];
  },

  findAll: async (company_id) => {
    const query = `
      SELECT a.*,
             COUNT(al.lead_id)::int AS lead_count
      FROM audiences a
      LEFT JOIN audience_leads al ON a.id = al.audience_id
      WHERE a.company_id = $1
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;
    const { rows } = await db.query(query, [company_id]);
    return rows;
  },

  findById: async (id) => {
    const { rows } = await db.query('SELECT * FROM audiences WHERE id = $1', [id]);
    if (!rows[0]) return null;

    // Fetch leads in this audience
    const leadsQuery = `
      SELECT l.id, l.name, l.email, l.company, l.status
      FROM audience_leads al
      JOIN leads l ON al.lead_id = l.id
      WHERE al.audience_id = $1
    `;
    const { rows: leads } = await db.query(leadsQuery, [id]);
    rows[0].leads = leads;
    return rows[0];
  },

  update: async (id, { name, description }) => {
    const query = `
      UPDATE audiences
      SET name        = COALESCE($1, name),
          description = COALESCE($2, description)
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, description, id]);
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await db.query('DELETE FROM audiences WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  },

  addLead: async (audience_id, lead_id) => {
    const query = `
      INSERT INTO audience_leads (audience_id, lead_id)
      VALUES ($1, $2)
      ON CONFLICT (audience_id, lead_id) DO NOTHING
      RETURNING *
    `;
    const { rows } = await db.query(query, [audience_id, lead_id]);
    return rows[0];
  },

  removeLead: async (audience_id, lead_id) => {
    const { rows } = await db.query(
      'DELETE FROM audience_leads WHERE audience_id = $1 AND lead_id = $2 RETURNING id',
      [audience_id, lead_id]
    );
    return rows[0];
  }
};

module.exports = Audience;

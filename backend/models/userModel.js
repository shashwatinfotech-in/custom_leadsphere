const db = require('../config/db');

const buildSelect = () => `
  SELECT
    u.id,
    u.company_id,
    u.name,
    u.email,
    u.phone,
    u.role_id,
    r.name AS role_name,
    r.name AS role,
    u.status,
    u.status AS is_active,
    '{}'::jsonb AS permissions,
    u.last_login,
    u.city_id,
    c.name AS city_name,
    u.created_at
  FROM users u
  LEFT JOIN roles r ON u.role_id = r.id
  LEFT JOIN cities c ON u.city_id = c.id
`;

const normalizeStatus = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() !== 'false';
  return Boolean(value);
};

const User = {
  create: async ({
    company_id,
    name,
    email,
    phone,
    role_id,
    password,
    permissions,
    city_id,
    status = true
  }) => {
    const query = `
      INSERT INTO users (company_id, name, email, phone, role_id, password, status, city_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    const values = [
      company_id,
      name,
      email,
      phone || null,
      role_id || null,
      password,
      normalizeStatus(status) ?? true,
      city_id || null
    ];

    const { rows } = await db.query(query, values);
    return User.findById(rows[0].id);
  },

  findByEmail: async (email) => {
    const { rows } = await db.query(`
      SELECT
        u.id,
        u.company_id,
        u.name,
        u.email,
        u.phone,
        u.role_id,
        r.name AS role_name,
        r.name AS role,
        u.status,
        u.status AS is_active,
        '{}'::jsonb AS permissions,
        u.last_login,
        u.city_id,
        c.name AS city_name,
        u.created_at,
        u.password
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN cities c ON u.city_id = c.id
      WHERE u.email = $1
      LIMIT 1
    `, [email]);
    return rows[0];
  },

  findById: async (id) => {
    const { rows } = await db.query(`
      ${buildSelect()}
      WHERE u.id = $1
      LIMIT 1
    `, [id]);
    return rows[0];
  },

  findAll: async (companyId, filters = {}) => {
    const values = [companyId];
    let idx = 2;
    let query = `${buildSelect()} WHERE u.company_id = $1`;

    if (filters.role_id !== undefined && filters.role_id !== null && filters.role_id !== '') {
      query += ` AND u.role_id = $${idx++}`;
      values.push(filters.role_id);
    } else if (filters.role) {
      query += ` AND LOWER(r.name) = LOWER($${idx++})`;
      values.push(filters.role);
    }

    if (filters.city_id !== undefined && filters.city_id !== null && filters.city_id !== '') {
      query += ` AND u.city_id = $${idx++}`;
      values.push(filters.city_id);
    }

    if (filters.status !== undefined && filters.status !== null && filters.status !== '') {
      query += ` AND u.status = $${idx++}`;
      values.push(normalizeStatus(filters.status));
    }

    query += ' ORDER BY u.created_at DESC';
    const { rows } = await db.query(query, values);
    return rows;
  },

  update: async (id, data) => {
    const {
      name,
      email,
      phone,
      role_id,
      status,
      is_active,
      permissions,
      city_id,
      city_id_provided
    } = data;

    const statusValue = status !== undefined ? normalizeStatus(status) : normalizeStatus(is_active);

    const query = `
      UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          phone = COALESCE($3, phone),
          role_id = COALESCE($4, role_id),
          status = COALESCE($5, status),
          city_id = CASE WHEN $7 THEN $6 ELSE city_id END
      WHERE id = $8
      RETURNING id
    `;

    const { rows } = await db.query(query, [
      name,
      email,
      phone,
      role_id || null,
      statusValue,
      city_id !== undefined ? city_id : null,
      Boolean(city_id_provided),
      id
    ]);

    return rows[0] ? User.findById(rows[0].id) : null;
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

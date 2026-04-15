const User = require('../models/userModel');
const Role = require('../models/roleModel');
const City = require('../models/cityModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('csv-parser');

const DEFAULT_PERMISSIONS = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: false,
  userManagement: false,
  configuration: false
};

const isCompanyAdmin = (req) => String(req.user?.role || '').toLowerCase() === 'company_admin';

const parseId = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizePermissions = async (roleRow, explicitPermissions) => {
  if (explicitPermissions !== undefined && explicitPermissions !== null) {
    return explicitPermissions;
  }

  if (roleRow?.permissions) {
    return roleRow.permissions;
  }

  const name = String(roleRow?.name || '').toLowerCase();
  if (name === 'company_admin' || name === 'admin' || name === 'superadmin') {
    return {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: true,
      configuration: true
    };
  }

  if (name === 'manager') {
    return {
      dashboard: true,
      leads: true,
      campaigns: true,
      whatsapp: true,
      settings: true,
      userManagement: false,
      configuration: true
    };
  }

  return DEFAULT_PERMISSIONS;
};

const resolveRole = async ({ role_id, role }) => {
  if (role_id !== undefined && role_id !== null && role_id !== '') {
    const found = await Role.findById(role_id);
    if (!found) return null;
    return found;
  }

  if (role) {
    const found = await Role.findByName(role);
    if (found) return found;
  }

  return null;
};

const sanitizeUserPayload = async (body) => {
  const role_id = parseId(body.role_id);
  const city_id = parseId(body.city_id);
  const roleRow = await resolveRole({ role_id, role: body.role });
  const permissions = await normalizePermissions(roleRow, body.permissions);

  return {
    name: body.name ? String(body.name).trim() : undefined,
    email: body.email ? String(body.email).trim() : undefined,
    phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
    role: roleRow?.name || (body.role ? String(body.role).trim() : undefined),
    role_id: roleRow?.id || role_id || null,
    city_id,
    city_id_provided: Object.prototype.hasOwnProperty.call(body, 'city_id'),
    permissions,
    status: body.status !== undefined ? body.status : body.is_active
  };
};

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const filters = {
      city_id: parseId(req.query.city_id),
      role_id: parseId(req.query.role_id)
    };

    if (!filters.role_id && req.query.role && req.query.role !== 'all') {
      filters.role = req.query.role;
    }

    const users = await User.findAll(req.user.company_id, filters);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let roleRow = await resolveRole({ role_id: req.body.role_id, role: req.body.role });
    if ((req.body.role_id !== undefined || req.body.role !== undefined) && !roleRow) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }
    if (!roleRow) {
      roleRow = await Role.findByName('user');
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const permissions = await normalizePermissions(roleRow, req.body.permissions);
    const city_id = parseId(req.body.city_id);

    const user = await User.create({
      company_id: req.user.company_id,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : null,
      role: roleRow?.name || null,
      role_id: roleRow?.id || parseId(req.body.role_id),
      password: hashed,
      permissions,
      city_id,
      status: true
    });

    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/users/import
const importUsers = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const cleaned = {
          name: row.name || row.Name || row.full_name,
          email: row.email || row.Email,
          phone: row.phone || row.Phone || '',
          role: row.role || row.Role || 'user',
          password: row.password || row.Password || 'Welcome123!',
          city: row.city || row.City || row.city_name || row.CityName || ''
        };
        if (cleaned.name && cleaned.email) results.push(cleaned);
      })
      .on('end', async () => {
        let count = 0;
        const salt = await bcrypt.genSalt(10);
        for (const row of results) {
          try {
            const exists = await User.findByEmail(row.email);
            if (exists) continue;

            let roleRow = await resolveRole({ role: row.role });
            if (!roleRow) {
              roleRow = await Role.findByName('user');
            }
            const cityRow = row.city ? await City.findByName(row.city) : null;

            await User.create({
              company_id: req.user.company_id,
              name: row.name,
              email: row.email,
              phone: row.phone,
              role: roleRow?.name || row.role,
              role_id: roleRow?.id || null,
              password: await bcrypt.hash(row.password, salt),
              permissions: await normalizePermissions(roleRow, null),
              city_id: cityRow?.id || null,
              status: true
            });
            count++;
          } catch (e) {
            console.error('Import row error:', row.email, e.message);
          }
        }
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ message: `Successfully imported ${count} users` });
      })
      .on('error', (err) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: 'Error reading CSV file' });
      });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/users/export
const exportUsers = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.findAll(req.user.company_id, {});
    const header = 'Name,Email,Phone,Role,City,Status,Last Login\n';
    const csvData = header + users.map(u =>
      `"${u.name}","${u.email}","${u.phone || ''}","${u.role_name || u.role || ''}","${u.city_name || ''}","${u.status ? 'Active' : 'Inactive'}","${u.last_login || '-'}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.status(200).send(csvData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (target.company_id !== req.user.company_id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payload = await sanitizeUserPayload(req.body);
    if ((req.body.role_id !== undefined || req.body.role !== undefined) && !payload.role_id) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }
    if (req.body.permissions !== undefined) {
      payload.permissions = req.body.permissions;
    }

    const updated = await User.update(req.params.id, payload);
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (target.company_id !== req.user.company_id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (target.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.delete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getUsers, createUser, importUsers, exportUsers, updateUser, deleteUser };

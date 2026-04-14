const User    = require('../models/userModel');
const Role    = require('../models/roleModel');
const bcrypt  = require('bcryptjs');
const fs      = require('fs');
const csv     = require('csv-parser');

const normalizeRoleKey = async (role) => {
  if (!role) return 'user';

  const builtinMap = {
    'Admin': 'admin',
    'Manager': 'manager',
    'Sales Executive': 'user',
    'Super Admin': 'superadmin',
    'admin': 'admin',
    'manager': 'manager',
    'user': 'user',
    'superadmin': 'superadmin',
    'super_admin': 'superadmin'
  };

  if (builtinMap[role]) {
    return builtinMap[role];
  }

  const exact = await Role.findByKey(role);
  if (exact) return exact.key;

  const byLabel = await Role.findByLabel(role);
  if (byLabel) return byLabel.key;

  return String(role)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const resolvePermissionsForRole = async (roleKey, explicitPermissions) => {
  if (explicitPermissions) return explicitPermissions;

  const role = await Role.findByKey(roleKey);
  if (role?.permissions) return role.permissions;

  if (roleKey === 'superadmin' || roleKey === 'admin') {
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

  if (roleKey === 'manager') {
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

  return {
    dashboard: true,
    leads: true,
    campaigns: true,
    whatsapp: true,
    settings: false,
    userManagement: false,
    configuration: false
  };
};

// GET /api/users  — admin only
const getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const users = await User.findAll(req.user.company_id);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/users  — admin only
const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const { name, email, phone, role, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const dbRole = await normalizeRoleKey(role);
    const permissions = await resolvePermissionsForRole(dbRole, req.body.permissions);

    const user = await User.create({
      company_id: req.user.company_id,
      name,
      email,
      phone: phone || null,
      role: dbRole,
      password: hashed,
      permissions
    });

    const { password: _, ...userResponse } = user;
    res.status(201).json(userResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/users/import  — admin only, multipart CSV
const importUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    if (!req.file)                 return res.status(400).json({ message: 'No file uploaded' });

    const results  = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const cleaned = {
          name:     row.name     || row.Name     || row.full_name,
          email:    row.email    || row.Email,
          phone:    row.phone    || row.Phone    || '',
          role:     row.role || row.Role || 'Sales Executive',
          password: row.password || row.Password || 'Welcome123!'
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
            const roleKey = await normalizeRoleKey(row.role);
            await User.create({
              company_id: req.user.company_id,
              name:       row.name,
              email:      row.email,
              phone:      row.phone,
              role:       roleKey,
              password:   await bcrypt.hash(row.password, salt),
              permissions: await resolvePermissionsForRole(roleKey, null)
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

// GET /api/users/export  — admin only
const exportUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const users   = await User.findAll(req.user.company_id);
    const header  = 'Name,Email,Phone,Role,Status,Last Login\n';
    const csvData = header + users.map(u =>
      `"${u.name}","${u.email}","${u.phone || ''}","${u.role}","${u.status ? 'Active' : 'Inactive'}","${u.last_login || '-'}"`
    ).join('\n');

    res.setHeader('Content-Type',        'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.status(200).send(csvData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/users/:id  — admin only
const updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.company_id !== req.user.company_id) return res.status(403).json({ message: 'Access denied' });

    const data = { ...req.body };
    if (data.role) data.role = await normalizeRoleKey(data.role);
    if (!data.permissions && data.role) {
      data.permissions = await resolvePermissionsForRole(data.role, null);
    }

    const updated = await User.update(req.params.id, data);
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/users/:id  — admin only
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.company_id !== req.user.company_id) return res.status(403).json({ message: 'Access denied' });
    if (target.id === req.user.id) return res.status(400).json({ message: 'Cannot delete your own account' });

    await User.delete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getUsers, createUser, importUsers, exportUsers, updateUser, deleteUser };

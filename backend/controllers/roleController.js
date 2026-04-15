const Role = require('../models/roleModel');
const db = require('../config/db');

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

const normalizeName = (value) => String(value || '').trim();

const normalizePermissions = (name, permissions) => {
  if (permissions !== undefined && permissions !== null) return permissions;

  const key = String(name || '').toLowerCase();
  if (key === 'company_admin' || key === 'admin' || key === 'superadmin') {
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

  if (key === 'manager') {
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

const getRoles = async (req, res) => {
  try {
    const includeInactive = String(req.query.include_inactive || req.query.includeInactive || 'true') !== 'false';
    const roles = await Role.findAll({ includeInactive });
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const createRole = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Only company admins can manage roles' });
    }

    const name = normalizeName(req.body.name);
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const existing = await Role.findByName(name);
    if (existing) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = await Role.create({
      name,
      is_active: req.body.is_active === undefined ? true : String(req.body.is_active).toLowerCase() !== 'false',
      permissions: normalizePermissions(name, req.body.permissions)
    });

    res.status(201).json(role);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Role already exists' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateRole = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Only company admins can manage roles' });
    }

    const target = await Role.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const updates = {};
    if (req.body.name !== undefined) {
      const name = normalizeName(req.body.name);
      if (!name) {
        return res.status(400).json({ message: 'name cannot be empty' });
      }
      updates.name = name;
    }
    if (req.body.is_active !== undefined) {
      updates.is_active = String(req.body.is_active).toLowerCase() !== 'false';
    }
    if (req.body.permissions !== undefined) {
      updates.permissions = req.body.permissions;
    }

    const updated = await Role.update(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Role already exists' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteRole = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Only company admins can manage roles' });
    }

    const target = await Role.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const usage = await db.query('SELECT COUNT(*)::int AS count FROM users WHERE role_id = $1', [req.params.id]);
    if (usage.rows[0].count > 0) {
      return res.status(400).json({ message: 'Role is assigned to users and cannot be deleted' });
    }

    await Role.delete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getRoles, createRole, updateRole, deleteRole };

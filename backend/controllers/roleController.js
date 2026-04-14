const Role = require('../models/roleModel');
const db = require('../config/db');

const defaultPermissionsByKey = {
  superadmin: {
    dashboard: true,
    leads: true,
    campaigns: true,
    whatsapp: true,
    settings: true,
    userManagement: true,
    configuration: true
  },
  admin: {
    dashboard: true,
    leads: true,
    campaigns: true,
    whatsapp: true,
    settings: true,
    userManagement: true,
    configuration: true
  },
  manager: {
    dashboard: true,
    leads: true,
    campaigns: true,
    whatsapp: true,
    settings: true,
    userManagement: false,
    configuration: true
  },
  user: {
    dashboard: true,
    leads: true,
    campaigns: true,
    whatsapp: true,
    settings: false,
    userManagement: false,
    configuration: false
  }
};

const slugifyKey = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

const getDefaultPermissions = (key) => {
  return defaultPermissionsByKey[key] || defaultPermissionsByKey.user;
};

const canManageRoles = (req) => req.user.role === 'superadmin';

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const createRole = async (req, res) => {
  try {
    if (!canManageRoles(req)) {
      return res.status(403).json({ message: 'Only super admins can create roles' });
    }

    const { label, permissions } = req.body;
    if (!label) {
      return res.status(400).json({ message: 'label is required' });
    }

    const key = slugifyKey(req.body.key || label);
    if (!key) {
      return res.status(400).json({ message: 'A valid role key could not be generated' });
    }

    const existing = await Role.findByKey(key);
    if (existing) {
      return res.status(400).json({ message: 'Role key already exists' });
    }

    const role = await Role.create({
      key,
      label,
      permissions: permissions || getDefaultPermissions(key),
      created_by: req.user.id,
      is_system: false
    });

    res.status(201).json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateRole = async (req, res) => {
  try {
    if (!canManageRoles(req)) {
      return res.status(403).json({ message: 'Only super admins can update roles' });
    }

    const target = await Role.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (target.is_system) {
      return res.status(400).json({ message: 'System roles cannot be modified' });
    }

    const updated = await Role.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteRole = async (req, res) => {
  try {
    if (!canManageRoles(req)) {
      return res.status(403).json({ message: 'Only super admins can delete roles' });
    }

    const target = await Role.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (target.is_system) {
      return res.status(400).json({ message: 'System roles cannot be deleted' });
    }

    const { rows } = await db.query(
      'SELECT COUNT(*)::int AS count FROM users WHERE role = $1',
      [target.key]
    );

    if (rows[0].count > 0) {
      return res.status(400).json({ message: 'Role is assigned to users and cannot be deleted' });
    }

    await Role.delete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getRoles, createRole, updateRole, deleteRole, getDefaultPermissions, slugifyKey };

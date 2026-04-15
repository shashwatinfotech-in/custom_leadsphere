const City = require('../models/cityModel');
const db = require('../config/db');

const isCompanyAdmin = (req) => String(req.user?.role || '').toLowerCase() === 'company_admin';

const parseBoolean = (value, fallback = true) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'false') return false;
    if (value.toLowerCase() === 'true') return true;
  }
  return fallback;
};

const getCities = async (req, res) => {
  try {
    const includeInactive = String(req.query.include_inactive || req.query.includeInactive || 'true') !== 'false';
    const cities = await City.findAll({ includeInactive });
    res.json(cities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const createCity = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Only company admins can manage cities' });
    }

    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const existing = await City.findByName(name);
    if (existing) {
      return res.status(400).json({ message: 'City already exists' });
    }

    const city = await City.create({
      name,
      is_active: parseBoolean(req.body.is_active, true)
    });

    res.status(201).json(city);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'City already exists' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateCity = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Only company admins can manage cities' });
    }

    const target = await City.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'City not found' });
    }

    const name = req.body.name !== undefined ? String(req.body.name).trim() : undefined;
    if (req.body.name !== undefined && !name) {
      return res.status(400).json({ message: 'name cannot be empty' });
    }

    const updated = await City.update(req.params.id, {
      name,
      is_active: req.body.is_active !== undefined ? parseBoolean(req.body.is_active, target.is_active) : undefined
    });

    res.json(updated);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'City already exists' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteCity = async (req, res) => {
  try {
    if (!isCompanyAdmin(req)) {
      return res.status(403).json({ message: 'Only company admins can manage cities' });
    }

    const target = await City.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'City not found' });
    }

    const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM users WHERE city_id = $1', [req.params.id]);
    if (rows[0].count > 0) {
      return res.status(400).json({ message: 'City is assigned to users and cannot be deleted' });
    }

    const leadUsage = await db.query('SELECT COUNT(*)::int AS count FROM leads WHERE city_id = $1', [req.params.id]);
    if (leadUsage.rows[0].count > 0) {
      return res.status(400).json({ message: 'City is assigned to leads and cannot be deleted' });
    }

    await City.delete(req.params.id);
    res.json({ message: 'City deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getCities, createCity, updateCity, deleteCity };

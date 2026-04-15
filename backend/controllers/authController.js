const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const Role = require('../models/roleModel');
const City = require('../models/cityModel');

const fallbackPermissions = {
  dashboard: true,
  leads: true,
  campaigns: true,
  whatsapp: true,
  settings: true,
  userManagement: true,
  configuration: true
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      companyName,
      name,
      email,
      phone,
      password,
      city_id,
      role_id
    } = req.body;

    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ message: 'companyName, name, email and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const parsedRoleId = role_id === undefined || role_id === null || role_id === '' ? null : Number(role_id);
    if (parsedRoleId !== null && Number.isNaN(parsedRoleId)) {
      return res.status(400).json({ message: 'role_id must be a valid number' });
    }

    const parsedCityId = city_id === undefined || city_id === null || city_id === '' ? null : Number(city_id);
    if (parsedCityId !== null && Number.isNaN(parsedCityId)) {
      return res.status(400).json({ message: 'city_id must be a valid number' });
    }

    let assignedRole = null;
    if (parsedRoleId) {
      assignedRole = await Role.findById(parsedRoleId);
    }

    if (!assignedRole) {
      assignedRole = await Role.findByName('company_admin') || await Role.findByName('admin');
    }

    if (!assignedRole) {
      return res.status(400).json({ message: 'No valid role found. Seed roles first.' });
    }

    let assignedCityId = null;
    if (parsedCityId) {
      const foundCity = await City.findById(parsedCityId);
      if (!foundCity) {
        return res.status(400).json({ message: 'Invalid city_id. City not found.' });
      }
      assignedCityId = foundCity.id;
    }

    const company = await Company.create({
      id: randomUUID(),
      name: companyName,
      email,
      phone
    });

    const user = await User.create({
      company_id: company.id,
      name,
      email,
      phone: phone || null,
      role_id: assignedRole?.id || null,
      password: hashedPassword,
      permissions: assignedRole?.permissions || fallbackPermissions,
      city_id: assignedCityId,
      status: true
    });

    const token = jwt.sign(
      { id: user.id, role_id: user.role_id, company_id: company.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Company and admin created successfully',
      user,
      company,
      token
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid role_id or city_id reference' });
    }
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid input format for one or more fields' });
    }
    console.error('Register error:', error);
    return res.status(500).json({
      message: 'Server Error'
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    if (!user.status) {
      return res.status(403).json({ message: 'Your account is inactive. Contact your admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    await User.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, role_id: user.role_id, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { register, login, getMe };

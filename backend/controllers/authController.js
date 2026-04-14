const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/userModel');
const Company = require('../models/companyModel');
const Role    = require('../models/roleModel');

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
// Creates a new company + admin user in one shot
const register = async (req, res) => {
  try {
    const { companyName, name, email, phone, password } = req.body;

    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ message: 'companyName, name, email and password are required' });
    }

    const existing = await User.findByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    // 1. Create the company (tenant)
    const company = await Company.create({ name: companyName, email, phone });

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const adminRole = await Role.findByKey('admin');

    // 3. Create admin user linked to company
    const user = await User.create({
      company_id: company.id,
      name,
      email,
      phone: phone || null,
      role: 'admin',
      password: hashedPassword,
      permissions: adminRole?.permissions || fallbackPermissions
    });

    // 4. Sign JWT  — payload: { id, role, company_id }
    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: company.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ user, company, token });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).send('Server Error');
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

    // Update last login timestamp
    await User.updateLastLogin(user.id);

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
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

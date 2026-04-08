const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/register  — create company + admin user
router.post(
  '/register',
  [
    check('companyName', 'Company name is required').not().isEmpty(),
    check('name',        'Name is required').not().isEmpty(),
    check('email',       'Valid email is required').isEmail(),
    check('password',    'Password must be 6+ characters').isLength({ min: 6 }),
    validate
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    check('email',    'Valid email is required').isEmail(),
    check('password', 'Password is required').exists(),
    validate
  ],
  login
);

// GET /api/auth/me
router.get('/me', auth, getMe);

module.exports = router;

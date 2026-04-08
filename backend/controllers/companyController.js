const Company = require('../models/companyModel');

// GET /api/companies/me
const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company_id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/companies/me  (admin only)
const updateMyCompany = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update company settings' });
    }
    const company = await Company.update(req.user.company_id, req.body);
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// SUPER ADMIN ONLY: GET /api/companies
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json(companies);
  } catch (err) { res.status(500).send('Server Error'); }
};

// SUPER ADMIN ONLY: PUT /api/companies/:id
const updateCompanyStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const company = await Company.update(req.params.id, { is_active });
    res.json(company);
  } catch (err) { res.status(500).send('Server Error'); }
};

module.exports = { getMyCompany, updateMyCompany, getAllCompanies, updateCompanyStatus };

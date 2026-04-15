const isCompanyAdmin = (role) => {
  const normalized = String(role || '').toLowerCase();
  return normalized === 'company_admin';
};

const companyAdminOnly = (req, res, next) => {
  if (!req.user || !isCompanyAdmin(req.user.role)) {
    return res.status(403).json({ message: 'Access denied: company admin role required' });
  }
  next();
};

module.exports = companyAdminOnly;

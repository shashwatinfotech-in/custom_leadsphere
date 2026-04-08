const Lead = require('../models/leadModel');

// Helper: check if user can access this lead
const canAccess = (user, lead) => {
  if (user.role === 'admin' || user.role === 'manager') return true;
  return lead.created_by === user.id || lead.assigned_to === user.id;
};

// POST /api/leads
const createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      created_by: req.user.id,
      company_id: req.user.company_id
    });
    res.status(201).json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/leads
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll(req.query, req.user.id, req.user.role, req.user.company_id);
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/leads/:id
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (lead.company_id !== req.user.company_id) return res.status(403).json({ message: 'Access denied' });
    if (!canAccess(req.user, lead)) return res.status(403).json({ message: 'Access denied' });
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/leads/:id
const updateLead = async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Lead not found' });
    if (existing.company_id !== req.user.company_id) return res.status(403).json({ message: 'Access denied' });
    
    // Only Admin can edit lead details/profile
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Employees can only update lead status, not edit details' });
    }

    const lead = await Lead.update(req.params.id, req.body);
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/leads/:id
const deleteLead = async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Lead not found' });
    if (existing.company_id !== req.user.company_id) return res.status(403).json({ message: 'Access denied' });
    if (!canAccess(req.user, existing)) return res.status(403).json({ message: 'Access denied' });

    await Lead.delete(req.params.id);
    res.json({ message: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PATCH /api/leads/:id/status
const updateStatus = async (req, res) => {
  try {
    const { new_status, old_status } = req.body;
    const lead = await Lead.updateStatus(req.params.id, new_status, req.user.id, old_status);
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/leads/:id/custom-values
const setCustomValue = async (req, res) => {
  try {
    const { field_id, value } = req.body;
    const result = await Lead.setCustomValue(req.params.id, field_id, value);
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/leads/export
const exportLeads = async (req, res) => {
  try {
    const leads  = await Lead.findAll(req.query, req.user.id, req.user.role, req.user.company_id);
    const header = 'Name,Email,Phone,Company,Source,Status,Created At\n';
    const body   = leads.map(l =>
      `"${l.name || ''}","${l.email || ''}","${l.phone || ''}","${l.company || ''}","${l.source || ''}","${l.status || ''}","${l.created_at}"`
    ).join('\n');

    res.setHeader('Content-Type',        'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.csv`);
    res.status(200).send(header + body);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/leads/stats
const getDashboardStats = async (req, res) => {
  try {
    const all      = await Lead.findAll({}, req.user.id, req.user.role, req.user.company_id);
    const total    = all.length;
    const won      = all.filter(l => l.status?.toLowerCase() === 'won').length;
    const rate     = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0';

    // Status breakdown
    const byStatus = all.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalLeads:       total,
      conversionRate:   parseFloat(rate),
      wonLeads:         won,
      byStatus,
      emailsSent:       0,
      whatsappSent:     0,
      totalLeadsChange: 0,
      conversionChange: 0,
      emailsChange:     0,
      whatsappChange:   0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createLead, getLeads, getLeadById, updateLead, deleteLead,
  updateStatus, setCustomValue, exportLeads, getDashboardStats
};

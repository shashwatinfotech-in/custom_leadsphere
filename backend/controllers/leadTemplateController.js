const LeadTemplate = require('../models/leadTemplateModel');

// GET /api/lead-templates
const getLeadTemplates = async (req, res) => {
  try {
    const templates = await LeadTemplate.findAll(req.user.company_id);
    res.json(templates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/lead-templates
const createLeadTemplate = async (req, res) => {
  try {
    if (req.user.role === 'user') return res.status(403).json({ message: 'Access denied' });
    const { name, description, fields } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const template = await LeadTemplate.create({
      company_id: req.user.company_id,
      name,
      description,
      fields: fields || []
    });
    res.status(201).json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/lead-templates/:id
const getLeadTemplateById = async (req, res) => {
  try {
    const template = await LeadTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/lead-templates/:id
const updateLeadTemplate = async (req, res) => {
  try {
    if (req.user.role === 'user') return res.status(403).json({ message: 'Access denied' });
    const template = await LeadTemplate.update(req.params.id, req.body);
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/lead-templates/:id
const deleteLeadTemplate = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    await LeadTemplate.delete(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getLeadTemplates, createLeadTemplate, getLeadTemplateById,
  updateLeadTemplate, deleteLeadTemplate
};

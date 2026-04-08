const EmailTemplate = require('../models/emailTemplateModel');

// GET /api/email-templates
const getEmailTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.findAll(req.user.company_id);
    res.json(templates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/email-templates
const createEmailTemplate = async (req, res) => {
  try {
    const { template_name, subject, body } = req.body;
    if (!template_name || !subject || !body) {
      return res.status(400).json({ message: 'template_name, subject and body are required' });
    }
    const template = await EmailTemplate.create({
      company_id:    req.user.company_id,
      template_name,
      subject,
      body,
      created_by:    req.user.id
    });
    res.status(201).json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/email-templates/:id
const updateEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.update(req.params.id, req.body);
    res.json(template);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/email-templates/:id
const deleteEmailTemplate = async (req, res) => {
  try {
    await EmailTemplate.delete(req.params.id);
    res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate };

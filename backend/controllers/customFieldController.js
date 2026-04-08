const CustomField = require('../models/customFieldModel');

// GET /api/custom-fields
const getCustomFields = async (req, res) => {
  try {
    const fields = await CustomField.findAll(req.user.company_id);
    res.json(fields);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/custom-fields
const createCustomField = async (req, res) => {
  try {
    if (req.user.role === 'user') return res.status(403).json({ message: 'Access denied' });
    const { field_name, field_type, options } = req.body;
    if (!field_name || !field_type) {
      return res.status(400).json({ message: 'field_name and field_type are required' });
    }
    const field = await CustomField.create({
      company_id: req.user.company_id,
      field_name,
      field_type,
      options: options || null
    });
    res.status(201).json(field);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/custom-fields/:id
const updateCustomField = async (req, res) => {
  try {
    if (req.user.role === 'user') return res.status(403).json({ message: 'Access denied' });
    const field = await CustomField.update(req.params.id, req.body);
    res.json(field);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/custom-fields/:id
const deleteCustomField = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    await CustomField.delete(req.params.id);
    res.json({ message: 'Field deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getCustomFields, createCustomField, updateCustomField, deleteCustomField };

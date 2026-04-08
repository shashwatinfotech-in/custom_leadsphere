const Audience = require('../models/audienceModel');

// GET /api/audiences
const getAudiences = async (req, res) => {
  try {
    const audiences = await Audience.findAll(req.user.company_id);
    res.json(audiences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/audiences
const createAudience = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const audience = await Audience.create({
      company_id:  req.user.company_id,
      name,
      description,
      created_by:  req.user.id
    });
    res.status(201).json(audience);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET /api/audiences/:id
const getAudienceById = async (req, res) => {
  try {
    const audience = await Audience.findById(req.params.id);
    if (!audience) return res.status(404).json({ message: 'Audience not found' });
    res.json(audience);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/audiences/:id
const updateAudience = async (req, res) => {
  try {
    const audience = await Audience.update(req.params.id, req.body);
    res.json(audience);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/audiences/:id
const deleteAudience = async (req, res) => {
  try {
    await Audience.delete(req.params.id);
    res.json({ message: 'Audience deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/audiences/:id/leads
const addLeadToAudience = async (req, res) => {
  try {
    const { lead_id } = req.body;
    if (!lead_id) return res.status(400).json({ message: 'lead_id is required' });
    const result = await Audience.addLead(req.params.id, lead_id);
    res.status(201).json(result || { message: 'Lead already in audience' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/audiences/:id/leads/:leadId
const removeLeadFromAudience = async (req, res) => {
  try {
    await Audience.removeLead(req.params.id, req.params.leadId);
    res.json({ message: 'Lead removed from audience' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAudiences, createAudience, getAudienceById, updateAudience,
  deleteAudience, addLeadToAudience, removeLeadFromAudience
};

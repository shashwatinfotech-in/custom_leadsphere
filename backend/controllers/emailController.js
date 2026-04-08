const Email = require('../models/emailModel');

// GET /api/emails
const getEmails = async (req, res) => {
  try {
    const emails = await Email.findAll(req.user.company_id, req.query);
    res.json(emails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/emails — record a sent email
const sendEmail = async (req, res) => {
  try {
    const { lead_id, template_id, subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'subject and message are required' });
    }
    const email = await Email.create({
      company_id:  req.user.company_id,
      lead_id:     lead_id || null,
      template_id: template_id || null,
      subject,
      message,
      sent_by:     req.user.id
    });
    res.status(201).json(email);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = { getEmails, sendEmail };

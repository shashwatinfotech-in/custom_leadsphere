const express = require('express');
const db      = require('../config/db');
const auth    = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/activities?lead_id=xxx  — returns activity log for a lead
router.get('/', async (req, res) => {
  try {
    const { lead_id } = req.query;
    let query  = `
      SELECT a.*, u.name AS created_by_name
      FROM lead_activity_logs a
      LEFT JOIN users u ON a.created_by = u.id
    `;
    const values = [];

    if (lead_id) {
      query += ' WHERE a.lead_id = $1';
      values.push(lead_id);
    }

    query += ' ORDER BY a.created_at DESC LIMIT 100';
    const { rows } = await db.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

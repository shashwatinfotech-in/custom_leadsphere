const express = require('express');
const { check } = require('express-validator');
const {
  createLead, getLeads, getLeadById, updateLead, deleteLead,
  updateStatus, setCustomValue, exportLeads, getDashboardStats
} = require('../controllers/leadController');
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(auth);

router.get('/stats',  getDashboardStats);
router.get('/export', exportLeads);
router.get('/',       getLeads);
router.get('/:id',    getLeadById);

router.post('/', [check('name', 'Name is required').not().isEmpty(), validate], createLead);
router.put('/:id',    updateLead);
router.delete('/:id', deleteLead);

router.patch(
  '/:id/status',
  [
    check('new_status', 'new_status is required').not().isEmpty(),
    check('old_status', 'old_status is required').not().isEmpty(),
    validate
  ],
  updateStatus
);

router.post(
  '/:id/custom-values',
  [
    check('field_id', 'field_id is required').not().isEmpty(),
    check('value',    'value is required').not().isEmpty(),
    validate
  ],
  setCustomValue
);

module.exports = router;

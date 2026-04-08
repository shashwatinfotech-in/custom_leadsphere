const express = require('express');
const {
  getLeadTemplates, createLeadTemplate, getLeadTemplateById,
  updateLeadTemplate, deleteLeadTemplate
} = require('../controllers/leadTemplateController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/',       getLeadTemplates);
router.post('/',      createLeadTemplate);
router.get('/:id',    getLeadTemplateById);
router.put('/:id',    updateLeadTemplate);
router.delete('/:id', deleteLeadTemplate);

module.exports = router;

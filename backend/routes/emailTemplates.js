const express = require('express');
const {
  getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate
} = require('../controllers/emailTemplateController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/',       getEmailTemplates);
router.post('/',      createEmailTemplate);
router.put('/:id',    updateEmailTemplate);
router.delete('/:id', deleteEmailTemplate);

module.exports = router;

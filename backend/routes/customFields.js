const express = require('express');
const {
  getCustomFields, createCustomField, updateCustomField, deleteCustomField
} = require('../controllers/customFieldController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/',       getCustomFields);
router.post('/',      createCustomField);
router.put('/:id',    updateCustomField);
router.delete('/:id', deleteCustomField);

module.exports = router;

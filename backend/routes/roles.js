const express = require('express');
const auth = require('../middleware/auth');
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');

const router = express.Router();

router.use(auth);

router.get('/', getRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

module.exports = router;

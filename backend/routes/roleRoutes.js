const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const companyAdminOnly = require('../middleware/companyAdminOnly');
const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/roleController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRoles);
router.post('/', companyAdminOnly, createRole);
router.put('/:id', companyAdminOnly, updateRole);
router.delete('/:id', companyAdminOnly, deleteRole);

module.exports = router;

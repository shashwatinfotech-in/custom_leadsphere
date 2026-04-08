const express = require('express');
const { getMyCompany, updateMyCompany } = require('../controllers/companyController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/me', getMyCompany);
router.put('/me', updateMyCompany);

module.exports = router;

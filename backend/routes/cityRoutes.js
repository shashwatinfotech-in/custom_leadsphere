const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const companyAdminOnly = require('../middleware/companyAdminOnly');
const { getCities, createCity, updateCity, deleteCity } = require('../controllers/cityController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCities);
router.post('/', companyAdminOnly, createCity);
router.put('/:id', companyAdminOnly, updateCity);
router.delete('/:id', companyAdminOnly, deleteCity);

module.exports = router;

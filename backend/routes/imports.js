const express = require('express');
const multer  = require('multer');
const { importLeads, getImportHistory } = require('../controllers/importController');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(auth);

router.get('/',  getImportHistory);
router.post('/', upload.single('file'), importLeads);

module.exports = router;

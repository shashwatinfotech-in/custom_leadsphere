const express = require('express');
const { getEmails, sendEmail } = require('../controllers/emailController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/',  getEmails);
router.post('/', sendEmail);

module.exports = router;

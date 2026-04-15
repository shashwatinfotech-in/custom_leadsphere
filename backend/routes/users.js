const express = require('express');
const multer  = require('multer');
const {
  getUsers, createUser, importUsers, exportUsers, updateUser, deleteUser
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const companyAdminOnly = require('../middleware/companyAdminOnly');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

router.get('/',        getUsers);
router.get('/export',  exportUsers);
router.post('/',       companyAdminOnly, createUser);
router.post('/import', companyAdminOnly, upload.single('file'), importUsers);
router.put('/:id',     companyAdminOnly, updateUser);
router.delete('/:id',  companyAdminOnly, deleteUser);

module.exports = router;

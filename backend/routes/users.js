const express = require('express');
const multer  = require('multer');
const {
  getUsers, createUser, importUsers, exportUsers, updateUser, deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(auth);

router.get('/',        getUsers);
router.get('/export',  exportUsers);
router.post('/',       createUser);
router.post('/import', upload.single('file'), importUsers);
router.put('/:id',     updateUser);
router.delete('/:id',  deleteUser);

module.exports = router;

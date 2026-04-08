const express = require('express');
const {
  getAudiences, createAudience, getAudienceById, updateAudience,
  deleteAudience, addLeadToAudience, removeLeadFromAudience
} = require('../controllers/audienceController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/',                           getAudiences);
router.post('/',                          createAudience);
router.get('/:id',                        getAudienceById);
router.put('/:id',                        updateAudience);
router.delete('/:id',                     deleteAudience);
router.post('/:id/leads',                 addLeadToAudience);
router.delete('/:id/leads/:leadId',       removeLeadFromAudience);

module.exports = router;

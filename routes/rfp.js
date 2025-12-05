const express = require('express');
const router = express.Router();
const rfpsController = require('../controllers/rfpservice');

const auth = require('../middleware/auth');

router.get('/rfp', auth, rfpsController.listRFPs);
router.post('/create_rfp', auth, rfpsController.createRFP);
router.get('/rfp/:id', auth, rfpsController.getRFP);
router.patch('/rfp_update/:id', auth, rfpsController.updateRFP);
router.post('/generate-ai',auth, rfpsController.generateRFPWithAI);
router.post('/rfps/:id/send',auth, rfpsController.sendRFP);  

module.exports = router;


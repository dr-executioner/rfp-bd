const express = require('express');
const router = express.Router();
const rfpsController = require('../controllers/rfpservice');

const auth = require('../middleware/auth');

router.get('/rfps', auth, rfpsController.listRFPs);
router.post('/rfp/create', auth, rfpsController.createRFP);
router.get('/rfp/:id', auth, rfpsController.getRFP);
router.patch('/rfp_update/:id', auth, rfpsController.updateRFP);
router.post('/rfps/generate',auth, rfpsController.generateRFPWithAI);
router.post('/rfps/:id/send',auth, rfpsController.sendRFP);  
router.delete('/rfps/:id', auth, rfpsController.deleteRFP);


module.exports = router;


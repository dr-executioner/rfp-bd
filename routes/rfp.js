const express = require('express');
const router = express.Router();
const rfpsController = require('../controllers/rfpservice');

//const auth = require('../middleware/auth');

// Routes
router.get('/',  rfpsController.listRFPs);
router.post('/', rfpsController.createRFP);
router.get('/:id', rfpsController.getRFP);
router.patch('/:id', rfpsController.updateRFP);

module.exports = router;


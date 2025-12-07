const express = require('express');
const router = express.Router();
const proposalsController = require('../controllers/proposal-controller');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/proposals', proposalsController.getAllProposals);
router.get('/rfps/:rfp_id/proposals', proposalsController.getProposalsForRFP);
router.post('/rfps/:rfp_id/score-proposals', proposalsController.scoreProposals);

module.exports = router;


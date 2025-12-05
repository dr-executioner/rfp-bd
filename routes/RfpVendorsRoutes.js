const express = require('express');
const router = express.Router();
const rfpVendorsController = require('../controllers/RfpVendors');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/rfp_vendors', rfpVendorsController.linkVendorsToRFP);
router.get('/rfp_vendors/:rfp_id/vendors', rfpVendorsController.getVendorsForRFP);

module.exports = router;


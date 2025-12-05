const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendorservice');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/vendors', vendorsController.listVendors);
router.post('/vendors', vendorsController.createVendor);
router.get('/vendors/:id', vendorsController.getVendor);
router.patch('/vendors/:id', vendorsController.updateVendor);
router.delete('/vendors/:id', vendorsController.deleteVendor);

module.exports = router;


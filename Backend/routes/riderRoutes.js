const express = require('express');
const router = express.Router();
const { getRiderAvailability, updateRiderAvailability } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/availability', protect, authorize('rider', 'admin'), getRiderAvailability);
router.put('/availability', protect, authorize('rider', 'admin'), updateRiderAvailability);

module.exports = router;

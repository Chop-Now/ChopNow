const express = require('express');
const { guardIdParams } = require('../middleware/validateParams');

const router = guardIdParams(express.Router());
const { getRiderAvailability, updateRiderAvailability } = require('../controllers/userController');
const { getRiderDashboardStats, getRiderEarnings } = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/availability', protect, authorize('rider', 'admin'), getRiderAvailability);
router.put('/availability', protect, authorize('rider', 'admin'), updateRiderAvailability);
router.get('/stats', protect, authorize('rider'), getRiderDashboardStats);
router.get('/earnings', protect, authorize('rider'), getRiderEarnings);

module.exports = router;

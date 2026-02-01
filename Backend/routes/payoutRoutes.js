const express = require('express');
const router = express.Router();
const {
    requestPayout,
    getMyPayouts,
    getAdminPayouts,
    updatePayoutStatus
} = require('../controllers/payoutController');
const { protect, authorize } = require('../middleware/auth');

router.post('/request', protect, authorize('business_owner', 'manager'), requestPayout);
router.get('/me', protect, authorize('business_owner', 'manager'), getMyPayouts);
router.get('/admin', protect, authorize('admin'), getAdminPayouts);
router.patch('/:id/status', protect, authorize('admin'), updatePayoutStatus);

module.exports = router;

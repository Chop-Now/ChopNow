const express = require('express');
const router = express.Router();
const {
  requestPayout,
  getMyPayouts,
  getAdminPayouts,
  updatePayoutStatus,
} = require('../controllers/payoutController');
const { protect, authorize } = require('../middleware/auth');
const { validatePayoutRequest, validatePayoutStatus } = require('../middleware/validation');

router.post('/request', protect, authorize('business_owner'), validatePayoutRequest, requestPayout);
router.get('/me', protect, authorize('business_owner'), getMyPayouts);
router.get('/admin', protect, authorize('admin'), getAdminPayouts);
router.patch('/:id/status', protect, authorize('admin'), validatePayoutStatus, updatePayoutStatus);

module.exports = router;

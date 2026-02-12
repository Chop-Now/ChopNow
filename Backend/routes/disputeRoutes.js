const express = require('express');
const router = express.Router();
const {
    createDispute,
    getMyDisputes,
    getBusinessDisputes,
    getAdminDisputes,
    getDisputeById,
    resolveDispute,
    getDisputeStats
} = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createDispute);
router.get('/me', protect, getMyDisputes);
router.get('/stats', protect, authorize('admin', 'support'), getDisputeStats);
router.get('/business', protect, authorize('admin', 'business_owner', 'manager'), getBusinessDisputes);
router.get('/admin', protect, authorize('admin', 'support'), getAdminDisputes);
router.get('/:id', protect, getDisputeById);
router.patch('/:id/resolve', protect, authorize('admin', 'support'), resolveDispute);

module.exports = router;


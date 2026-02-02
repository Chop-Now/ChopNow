const express = require('express');
const router = express.Router();
const {
    getPlatformOverview,
    getBusinessOverview,
    getImpactLeaderboard,
    getMyImpact
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/platform/overview', protect, authorize('admin'), getPlatformOverview);
router.get('/business/overview', protect, authorize('business_owner', 'manager'), getBusinessOverview);
router.get('/impact/my', protect, getMyImpact);
router.get('/impact/leaderboard', getImpactLeaderboard);

module.exports = router;

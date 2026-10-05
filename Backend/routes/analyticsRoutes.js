const express = require('express');
const router = express.Router();
const {
  getPlatformOverview,
  getBusinessOverview,
  getImpactLeaderboard,
  getMyImpact,
  getRecentActivity,
  getImpactMethodology,
  getUserActivity,
  getAdminStats,
  getTestDataAudit,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/platform/overview', protect, authorize('admin'), getPlatformOverview);
router.get('/platform/activity', protect, authorize('admin'), getRecentActivity);
router.get('/user-activity', protect, authorize('admin'), getUserActivity);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/admin/data-audit', protect, authorize('admin'), getTestDataAudit);
router.get(
  '/business/overview',
  protect,
  authorize('admin', 'business_owner', 'manager'),
  getBusinessOverview
);
router.get('/impact/my', protect, getMyImpact);
router.get('/impact/leaderboard', getImpactLeaderboard);
router.get('/impact/methodology', getImpactMethodology);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getPublicSettings,
  getAllSettings,
  updateSettings,
  getCommissionRate,
  checkFeature,
  checkMaintenanceMode,
  emergencyMaintenanceOff
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/public', getPublicSettings);
router.get('/maintenance', checkMaintenanceMode);
router.get('/feature/:featureName', checkFeature);

// Emergency recovery route (requires secret key, no auth)
router.post('/recovery/maintenance-off', emergencyMaintenanceOff);

// Protected routes
router.get('/commission', protect, authorize('admin', 'business_owner'), getCommissionRate);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllSettings);
router.put('/', protect, authorize('admin'), updateSettings);

module.exports = router;

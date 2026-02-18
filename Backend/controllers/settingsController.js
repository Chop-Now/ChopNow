const PlatformSettings = require('../models/PlatformSettings');
const logger = require('../utils/logger');

/**
 * @desc    Get platform settings (public - limited fields)
 * @route   GET /api/settings/public
 * @access  Public
 */
const getPublicSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();

    // Return only public-facing settings
    res.json({
      platformName: settings.platformName,
      platformTagline: settings.platformTagline,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      allowNewRegistrations: settings.allowNewRegistrations,
      requireEmailVerification: settings.requireEmailVerification,
      allowGuestCheckout: settings.allowGuestCheckout,
      enableReviews: settings.enableReviews,
      enableNotifications: settings.enableNotifications,
      maintenanceMode: settings.maintenanceMode,
    });
  } catch (error) {
    logger.error({ err: error }, 'Settings error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get all platform settings (admin only)
 * @route   GET /api/settings
 * @access  Private (Admin)
 */
const getAllSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json(settings);
  } catch (error) {
    logger.error({ err: error }, 'Settings error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Update platform settings
 * @route   PUT /api/settings
 * @access  Private (Admin)
 */
const updateSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.updateSettings(req.body, req.user._id);

    res.json({
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    logger.error({ err: error }, 'Settings error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get commission rate for order calculations
 * @route   GET /api/settings/commission
 * @access  Private (Business Owner, Admin)
 */
const getCommissionRate = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json({
      platformFeePercent: settings.platformFeePercent,
      minimumWithdrawal: settings.minimumWithdrawal,
      payoutSchedule: settings.payoutSchedule,
    });
  } catch (error) {
    logger.error({ err: error }, 'Settings error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Check if a feature is enabled
 * @route   GET /api/settings/feature/:featureName
 * @access  Public
 */
const checkFeature = async (req, res) => {
  try {
    const { featureName } = req.params;
    const settings = await PlatformSettings.getSettings();

    const featureMap = {
      registration: settings.allowNewRegistrations,
      emailVerification: settings.requireEmailVerification,
      guestCheckout: settings.allowGuestCheckout,
      reviews: settings.enableReviews,
      notifications: settings.enableNotifications,
      maintenance: settings.maintenanceMode,
    };

    if (featureMap[featureName] === undefined) {
      return res.status(400).json({ message: 'Unknown feature' });
    }

    res.json({
      feature: featureName,
      enabled: featureMap[featureName],
    });
  } catch (error) {
    logger.error({ err: error }, 'Settings error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Check maintenance mode status
 * @route   GET /api/settings/maintenance
 * @access  Public
 */
const checkMaintenanceMode = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.json({
      maintenanceMode: settings.maintenanceMode,
      platformName: settings.platformName,
    });
  } catch (error) {
    logger.error({ err: error }, 'Settings error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Emergency recovery - turn off maintenance mode with secret key
 * @route   POST /api/settings/recovery/maintenance-off
 * @access  Public (requires ADMIN_RECOVERY_KEY)
 */
const emergencyMaintenanceOff = async (req, res) => {
  try {
    const { recoveryKey } = req.body;

    // Get the recovery key from environment variable
    const validRecoveryKey = process.env.ADMIN_RECOVERY_KEY;

    if (!validRecoveryKey) {
      return res.status(500).json({ message: 'Recovery key not configured on server' });
    }

    if (!recoveryKey || recoveryKey !== validRecoveryKey) {
      return res.status(403).json({ message: 'Invalid recovery key' });
    }

    // Turn off maintenance mode
    const settings = await PlatformSettings.getSettings();
    settings.maintenanceMode = false;
    await settings.save();

    res.json({
      success: true,
      message: 'Maintenance mode has been turned OFF',
      maintenanceMode: false,
    });
  } catch (error) {
    logger.error({ err: error }, 'Settings error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

module.exports = {
  getPublicSettings,
  getAllSettings,
  updateSettings,
  getCommissionRate,
  checkFeature,
  checkMaintenanceMode,
  emergencyMaintenanceOff,
};

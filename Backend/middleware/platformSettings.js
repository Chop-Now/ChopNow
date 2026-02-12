const PlatformSettings = require('../models/PlatformSettings');

/**
 * Middleware to check if platform is in maintenance mode
 * Allows admin users and settings/maintenance routes to bypass
 */
const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Allow settings routes to bypass
    if (req.path.includes('/api/settings')) {
      return next();
    }

    // Allow health check routes
    if (req.path === '/health' || req.path === '/ready') {
      return next();
    }

    const settings = await PlatformSettings.getSettings();

    if (settings.maintenanceMode) {
      // Allow admins to bypass maintenance mode
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      return res.status(503).json({
        message: 'Platform is currently under maintenance. Please try again later.',
        maintenanceMode: true,
        platformName: settings.platformName
      });
    }

    next();
  } catch (error) {
    // If settings can't be loaded, allow request to proceed
    next();
  }
};

/**
 * Middleware to check if new registrations are allowed
 */
const checkRegistrationAllowed = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.getSettings();

    if (!settings.allowNewRegistrations) {
      return res.status(403).json({
        message: 'New registrations are currently disabled. Please try again later.',
        registrationDisabled: true
      });
    }

    // Attach settings to request for use in controller
    req.platformSettings = settings;
    next();
  } catch (error) {
    // If settings can't be loaded, allow registration
    next();
  }
};

/**
 * Middleware to check if reviews are enabled
 */
const checkReviewsEnabled = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.getSettings();

    if (!settings.enableReviews) {
      return res.status(403).json({
        message: 'Reviews are currently disabled.',
        reviewsDisabled: true
      });
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Middleware to check if guest checkout is allowed
 */
const checkGuestCheckout = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.getSettings();

    // If user is authenticated, allow
    if (req.user) {
      req.platformSettings = settings;
      return next();
    }

    // If guest checkout is not allowed and user is not authenticated
    if (!settings.allowGuestCheckout) {
      return res.status(401).json({
        message: 'Please login to place an order. Guest checkout is not available.',
        guestCheckoutDisabled: true
      });
    }

    req.platformSettings = settings;
    next();
  } catch (error) {
    next();
  }
};

/**
 * Attach platform settings to request
 */
const attachPlatformSettings = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.getSettings();
    req.platformSettings = settings;
    next();
  } catch (error) {
    next();
  }
};

/**
 * Get platform fee percent for order calculations
 */
const getPlatformFee = async () => {
  try {
    const settings = await PlatformSettings.getSettings();
    return settings.platformFeePercent;
  } catch (error) {
    return 10; // Default 10%
  }
};

/**
 * Get payout settings
 */
const getPayoutSettings = async () => {
  try {
    const settings = await PlatformSettings.getSettings();
    return {
      minimumWithdrawal: settings.minimumWithdrawal,
      payoutSchedule: settings.payoutSchedule
    };
  } catch (error) {
    return {
      minimumWithdrawal: 5000,
      payoutSchedule: 'biweekly'
    };
  }
};

module.exports = {
  checkMaintenanceMode,
  checkRegistrationAllowed,
  checkReviewsEnabled,
  checkGuestCheckout,
  attachPlatformSettings,
  getPlatformFee,
  getPayoutSettings
};

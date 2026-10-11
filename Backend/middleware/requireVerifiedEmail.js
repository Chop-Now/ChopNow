const PlatformSettings = require('../models/PlatformSettings');

/**
 * While the admin "Require email verification" setting is on, an unverified account can
 * sign up, set up its shop and browse, but not take part in anything involving money or
 * trust (ordering, paying, listing food, reviewing, disputing, payouts). Registration has
 * to keep issuing a session so business sign-up can create the shop straight away.
 *
 * Admins are exempt, matching the login rule: a broken email provider must never lock
 * out the people who can switch the setting off. Use after `protect`.
 */
const requireVerifiedEmail = async (req, res, next) => {
  try {
    if (!req.user || req.user.emailVerified || req.user.roles?.includes('admin')) {
      return next();
    }
    const settings = await PlatformSettings.getSettings();
    if (!settings.requireEmailVerification) return next();

    return res.status(403).json({
      message: 'Please verify your email address first - check your inbox for the link we sent.',
      code: 'EMAIL_VERIFICATION_REQUIRED',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { requireVerifiedEmail };

const Payout = require('../models/Payout');
const Business = require('../models/Business');
const PlatformSettings = require('../models/PlatformSettings');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Request a payout
 * @route   POST /api/payouts/request
 * @access  Private (Business Owner/Manager/Rider)
 */
const requestPayout = async (req, res) => {
  const { amount, method } = req.body;

  try {
    // Get platform settings for minimum withdrawal
    const platformSettings = await PlatformSettings.getSettings();
    const minimumWithdrawal = platformSettings.minimumWithdrawal || 5000;

    if (amount < minimumWithdrawal) {
      return res.status(400).json({
        message: `Minimum withdrawal amount is ${minimumWithdrawal} RWF`,
        minimumWithdrawal,
      });
    }

    if (req.user.activeRole === 'rider') {
      // Atomic balance deduction from rider's user document
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, 'stats.riderBalance': { $gte: amount } },
        { $inc: { 'stats.riderBalance': -amount } },
        { new: true }
      );

      if (!user) {
        // Check if user exists but has insufficient balance
        const exists = await User.findById(req.user._id).lean();
        if (!exists) {
          return res.status(404).json({ message: 'User not found' });
        }
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const payout = await Payout.create({
        user: user._id,
        amount,
        method,
        status: 'requested',
      });

      return res.status(201).json(payout);
    } else {
      // Atomic balance deduction - prevents race condition
      const business = await Business.findOneAndUpdate(
        { owner: req.user._id, 'stats.balance': { $gte: amount } },
        { $inc: { 'stats.balance': -amount } },
        { new: true }
      );

      if (!business) {
        // Check if business exists but has insufficient balance
        const exists = await Business.findOne({ owner: req.user._id }).lean();
        if (!exists) {
          return res.status(404).json({ message: 'Business not found' });
        }
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      const payout = await Payout.create({
        business: business._id,
        amount,
        method,
        status: 'requested',
      });

      return res.status(201).json(payout);
    }
  } catch (error) {
    logger.error({ err: error }, 'Payout request failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get my business payouts
 * @route   GET /api/payouts/me
 * @access  Private (Business Owner/Manager)
 */
const getMyPayouts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    if (req.user.activeRole === 'rider') {
      const [payouts, total] = await Promise.all([
        Payout.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Payout.countDocuments({ user: req.user._id }),
      ]);
      return res.json({ payouts, currentPage: page, totalPages: Math.ceil(total / limit), total });
    } else {
      const business = await Business.findOne({ owner: req.user._id }).select('_id').lean();
      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      const [payouts, total] = await Promise.all([
        Payout.find({ business: business._id })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Payout.countDocuments({ business: business._id }),
      ]);
      return res.json({ payouts, currentPage: page, totalPages: Math.ceil(total / limit), total });
    }
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get all payouts (Admin)
 * @route   GET /api/payouts/admin
 * @access  Private (Admin)
 */
const getAdminPayouts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate('business', 'name contact stats payoutInfo')
        .populate('user', 'firstName lastName email phone stats')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payout.countDocuments(query),
    ]);
    res.json({ payouts, currentPage: page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Update payout status (Admin)
 * @route   PATCH /api/payouts/:id/status
 * @access  Private (Admin)
 */
const updatePayoutStatus = async (req, res) => {
  const { status, reference, failureReason } = req.body;

  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    if (payout.status === 'completed') {
      return res.status(400).json({ message: 'Payout already completed' });
    }

    payout.status = status;
    if (reference) payout.reference = reference;
    if (failureReason) payout.failureReason = failureReason;

    if (status === 'completed') {
      payout.processedAt = Date.now();
      payout.processedBy = req.user._id;
    } else if (status === 'failed' || status === 'cancelled') {
      // Revert balance atomically if payout failed
      if (payout.user) {
        await User.findByIdAndUpdate(payout.user, {
          $inc: { 'stats.riderBalance': payout.amount },
        });
      } else if (payout.business) {
        await Business.findByIdAndUpdate(payout.business, {
          $inc: { 'stats.balance': payout.amount },
        });
      }
    }

    await payout.save();
    res.json(payout);
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

module.exports = {
  requestPayout,
  getMyPayouts,
  getAdminPayouts,
  updatePayoutStatus,
};

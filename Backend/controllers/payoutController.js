const Payout = require('../models/Payout');
const Business = require('../models/Business');
const PlatformSettings = require('../models/PlatformSettings');

/**
 * @desc    Request a payout
 * @route   POST /api/payouts/request
 * @access  Private (Business Owner/Manager)
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
                minimumWithdrawal
            });
        }

        const business = await Business.findOne({ owner: req.user._id });
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        if (business.stats.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const payout = await Payout.create({
            business: business._id,
            amount,
            method,
            status: 'requested'
        });

        // Deduct from business balance pending payout
        business.stats.balance -= amount;
        await business.save();

        res.status(201).json(payout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get my business payouts
 * @route   GET /api/payouts/me
 * @access  Private (Business Owner/Manager)
 */
const getMyPayouts = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id });
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const payouts = await Payout.find({ business: business._id }).sort({ createdAt: -1 });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        const payouts = await Payout.find(query)
            .populate('business', 'name contact stats payoutInfo')
            .sort({ createdAt: -1 });
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
            // Revert balance if payout failed
            const business = await Business.findById(payout.business);
            if (business) {
                business.stats.balance += payout.amount;
                await business.save();
            }
        }

        await payout.save();
        res.json(payout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    requestPayout,
    getMyPayouts,
    getAdminPayouts,
    updatePayoutStatus
};

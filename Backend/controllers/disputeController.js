const Dispute = require('../models/Dispute');
const Order = require('../models/Order');

/**
 * @desc    Create a dispute/refund request
 * @route   POST /api/disputes
 * @access  Private (Customer)
 */
const createDispute = async (req, res) => {
    const { orderId, type, title, description, evidence } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure user owns the order
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to dispute this order' });
        }

        const dispute = await Dispute.create({
            order: orderId,
            customer: req.user._id,
            business: order.business,
            type,
            title,
            description,
            evidence,
            timeline: [{ event: 'Dispute created' }]
        });

        res.status(201).json(dispute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get my disputes
 * @route   GET /api/disputes/me
 * @access  Private (Customer)
 */
const getMyDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find({ customer: req.user._id })
            .populate('business', 'name')
            .sort({ createdAt: -1 });
        res.json(disputes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get disputes for my business
 * @route   GET /api/disputes/business
 * @access  Private (Admin/Business Owner/Manager)
 */
const getBusinessDisputes = async (req, res) => {
    try {
        const Business = require('../models/Business');

        // If admin, return all disputes
        if (req.user.activeRole === 'admin' || req.user.roles?.includes('admin')) {
            const disputes = await Dispute.find({})
                .populate('customer', 'firstName lastName email')
                .populate('business', 'name')
                .sort({ createdAt: -1 });
            return res.json({ disputes });
        }

        // For business owner, find their business first
        const business = await Business.findOne({ owner: req.user._id });
        if (!business) {
            return res.json({ disputes: [] });
        }

        const disputes = await Dispute.find({ business: business._id })
            .populate('customer', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.json({ disputes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get all disputes (Admin/Support)
 * @route   GET /api/disputes/admin
 * @access  Private (Admin/Support)
 */
const getAdminDisputes = async (req, res) => {
    try {
        const disputes = await Dispute.find({})
            .populate('customer', 'firstName lastName email')
            .populate('business', 'name')
            .sort({ priority: -1, createdAt: -1 });
        res.json({ disputes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get dispute by ID
 * @route   GET /api/disputes/:id
 * @access  Private
 */
const getDisputeById = async (req, res) => {
    try {
        const dispute = await Dispute.findById(req.params.id)
            .populate('customer', 'firstName lastName email phone')
            .populate('business', 'name contact')
            .populate('order');

        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        // Check authorization - user must be customer, business owner, or admin
        const isCustomer = dispute.customer._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'support';

        if (!isCustomer && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to view this dispute' });
        }

        res.json(dispute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get dispute statistics
 * @route   GET /api/disputes/stats
 * @access  Private (Admin/Support)
 */
const getDisputeStats = async (req, res) => {
    try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count resolved today
        const resolvedToday = await Dispute.countDocuments({
            status: 'resolved',
            'resolution.resolvedAt': { $gte: today, $lt: tomorrow }
        });

        // Count by priority
        const critical = await Dispute.countDocuments({ status: { $ne: 'resolved' }, priority: 'critical' });
        const high = await Dispute.countDocuments({ status: { $ne: 'resolved' }, priority: 'high' });
        const medium = await Dispute.countDocuments({ status: { $ne: 'resolved' }, priority: 'medium' });
        const low = await Dispute.countDocuments({ status: { $ne: 'resolved' }, priority: 'low' });

        // Total active (not resolved/closed)
        const totalActive = await Dispute.countDocuments({ status: { $nin: ['resolved', 'closed'] } });

        // Calculate average resolution time (for disputes resolved today)
        const resolvedDisputes = await Dispute.find({
            status: 'resolved',
            'resolution.resolvedAt': { $gte: today, $lt: tomorrow }
        });

        let avgResolutionMinutes = 0;
        if (resolvedDisputes.length > 0) {
            const totalMinutes = resolvedDisputes.reduce((sum, d) => {
                const created = new Date(d.createdAt).getTime();
                const resolved = new Date(d.resolution.resolvedAt).getTime();
                return sum + (resolved - created) / (1000 * 60);
            }, 0);
            avgResolutionMinutes = Math.round(totalMinutes / resolvedDisputes.length);
        }

        res.json({
            resolvedToday,
            totalActive,
            byPriority: { critical, high, medium, low },
            avgResolutionMinutes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Resolve a dispute
 * @route   PATCH /api/disputes/:id/resolve
 * @access  Private (Admin/Support)
 */
const resolveDispute = async (req, res) => {
    const { action, amount, comment } = req.body;

    try {
        const dispute = await Dispute.findById(req.params.id);
        if (!dispute) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        dispute.status = 'resolved';
        dispute.resolution = {
            action,
            amount,
            comment,
            resolvedBy: req.user._id,
            resolvedAt: Date.now()
        };
        dispute.timeline.push({ event: `Resolved with action: ${action}` });

        await dispute.save();
        res.json(dispute);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createDispute,
    getMyDisputes,
    getBusinessDisputes,
    getAdminDisputes,
    getDisputeById,
    resolveDispute,
    getDisputeStats
};

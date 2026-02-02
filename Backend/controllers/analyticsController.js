const Order = require('../models/Order');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const User = require('../models/User');

/**
 * @desc    Get Platform Overview Stats (Admin)
 * @route   GET /api/analytics/platform/overview
 * @access  Private (Admin)
 */
const getPlatformOverview = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalBusinesses = await Business.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'consumer' });

        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);

        const impactStats = await Business.aggregate([
            {
                $group: {
                    _id: null,
                    totalCo2Saved: { $sum: '$stats.impact.co2Saved' },
                    totalMealsRescued: { $sum: '$stats.impact.mealsRescued' },
                    totalWaterSaved: { $sum: '$stats.impact.waterSaved' }
                }
            }
        ]);

        res.json({
            overview: {
                totalOrders,
                totalBusinesses,
                totalUsers,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
            },
            impact: impactStats.length > 0 ? impactStats[0] : {
                totalCo2Saved: 0,
                totalMealsRescued: 0,
                totalWaterSaved: 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get Business Overview Stats
 * @route   GET /api/analytics/business/overview
 * @access  Private (Business Owner/Manager)
 */
const getBusinessOverview = async (req, res) => {
    try {
        const business = await Business.findOne({ owner: req.user._id });
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        const weeklySales = await Order.aggregate([
            {
                $match: {
                    business: business._id,
                    status: 'delivered',
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $week: '$createdAt' },
                    sales: { $sum: '$pricing.total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const topProductsIds = await Order.aggregate([
            { $match: { business: business._id, status: 'delivered' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.listing',
                    count: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Populate top product names
        const topProducts = await Listing.populate(topProductsIds, { path: '_id', select: 'title' });

        res.json({
            stats: business.stats,
            weeklyTrend: weeklySales,
            topProducts: topProducts.map(p => ({
                name: p._id.title,
                sold: p.count,
                revenue: p.revenue
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get Impact Leaderboard
 * @route   GET /api/analytics/impact/leaderboard
 * @access  Public
 */
const getImpactLeaderboard = async (req, res) => {
    try {
        const leaderboard = await Business.find({})
            .select('name stats.impact')
            .sort({ 'stats.impact.mealsRescued': -1 })
            .limit(10);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get my impact (Consumer/Business)
 * @route   GET /api/analytics/impact/my
 * @access  Private
 */
const getMyImpact = async (req, res) => {
    try {
        if (req.user.role === 'consumer') {
            // Calculate consumer impact based on orders
            const orders = await Order.find({ customer: req.user._id, status: 'delivered' })
                .populate('business');

            let mealsRescued = 0;
            let co2Saved = 0;
            let waterSaved = 0;

            // Simplified calculation - in real app, fetch from Listing details snapshot in Order
            // Assuming 1 item = 1 meal, and some constants
            orders.forEach(order => {
                order.items.forEach(item => {
                    mealsRescued += item.quantity;
                    co2Saved += (item.quantity * 2.5); // 2.5kg CO2 per meal
                    waterSaved += (item.quantity * 1000); // 1000L water per meal (beef example)
                });
            });

            res.json({
                mealsRescued,
                co2Saved,
                waterSaved,
                history: [] // Add history if needed
            });
        } else if (req.user.role === 'business_owner' || req.user.role === 'manager') {
            const business = await Business.findOne({ owner: req.user._id });
            if (!business) {
                return res.status(404).json({ message: 'Business not found' });
            }
            res.json(business.stats.impact);
        } else {
            res.status(400).json({ message: 'Invalid role for impact stats' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPlatformOverview,
    getBusinessOverview,
    getImpactLeaderboard,
    getMyImpact
};

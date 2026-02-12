const Order = require('../models/Order');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');

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

/**
 * @desc    Get Recent Platform Activity (Admin)
 * @route   GET /api/analytics/platform/activity
 * @access  Private (Admin)
 */
const getRecentActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const activities = [];

        // Get recent users (registered in last 7 days)
        const recentUsers = await User.find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
            .select('firstName lastName role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        recentUsers.forEach(user => {
            const roleName = user.role === 'business_owner' ? 'vendor' : user.role;
            activities.push({
                id: `user-${user._id}`,
                type: 'user',
                title: user.role === 'business_owner' ? 'New Vendor Registered' : 'New User Registered',
                description: `${user.firstName || ''} ${user.lastName || ''} has registered as a ${roleName}.`.trim(),
                timestamp: user.createdAt,
                icon: 'user'
            });
        });

        // Get recent orders
        const recentOrders = await Order.find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
            .select('orderNumber status pricing createdAt customer')
            .populate('customer', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(5);

        recentOrders.forEach(order => {
            const customerName = order.customer
                ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
                : 'A customer';

            if (order.status === 'pending' || order.status === 'confirmed') {
                activities.push({
                    id: `order-${order._id}`,
                    type: 'order',
                    title: 'New Order Placed',
                    description: `Order ${order.orderNumber} placed by ${customerName} for RWF ${(order.pricing?.total || 0).toLocaleString()}.`,
                    timestamp: order.createdAt,
                    icon: 'order'
                });
            } else if (order.status === 'completed') {
                activities.push({
                    id: `delivery-${order._id}`,
                    type: 'delivery',
                    title: 'Order Completed',
                    description: `Order ${order.orderNumber} has been completed successfully.`,
                    timestamp: order.updatedAt || order.createdAt,
                    icon: 'delivery'
                });
            }
        });

        // Get recent businesses/vendors
        const recentBusinesses = await Business.find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
            .select('name type status createdAt')
            .sort({ createdAt: -1 })
            .limit(3);

        recentBusinesses.forEach(business => {
            activities.push({
                id: `business-${business._id}`,
                type: 'business',
                title: business.status === 'approved' ? 'New Business Approved' : 'New Business Pending',
                description: `${business.name} (${business.type}) has been registered.`,
                timestamp: business.createdAt,
                icon: 'store'
            });
        });

        // Get recent reviews
        const recentReviews = await Review.find({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
            .select('rating comment createdAt customer business')
            .populate('customer', 'firstName lastName')
            .populate('business', 'name')
            .sort({ createdAt: -1 })
            .limit(3);

        recentReviews.forEach(review => {
            const customerName = review.customer
                ? `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim()
                : 'A customer';
            activities.push({
                id: `review-${review._id}`,
                type: 'review',
                title: 'New Review Posted',
                description: `${customerName} left a ${review.rating}-star review for ${review.business?.name || 'a business'}.`,
                timestamp: review.createdAt,
                icon: 'star'
            });
        });

        // Sort all activities by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Limit to requested number
        const limitedActivities = activities.slice(0, limit);

        res.json({
            activities: limitedActivities,
            total: activities.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get User Activity Log (Admin)
 * @route   GET /api/analytics/user-activity
 * @access  Private (Admin)
 */
const getUserActivity = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const timeRange = req.query.timeRange || '7days';

        // Calculate date filter
        let dateFilter = new Date();
        switch (timeRange) {
            case '24hours':
                dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case '7days':
                dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }

        const activities = [];

        // Get recent orders with user info
        const recentOrders = await Order.find({ createdAt: { $gte: dateFilter } })
            .select('orderNumber status pricing createdAt customer business')
            .populate('customer', 'firstName lastName email avatar role')
            .populate('business', 'name')
            .sort({ createdAt: -1 })
            .limit(limit);

        recentOrders.forEach(order => {
            if (order.customer) {
                activities.push({
                    id: `order-${order._id}`,
                    user: {
                        name: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.customer.email,
                        email: order.customer.email,
                        avatar: order.customer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.customer.email}`,
                        role: order.customer.role === 'business_owner' ? 'vendor' : (order.customer.role || 'customer')
                    },
                    action: 'Placed a new order',
                    details: `Order #${order.orderNumber} - ${order.business?.name || 'Unknown vendor'} - RWF ${(order.pricing?.total || 0).toLocaleString()}`,
                    timestamp: order.createdAt,
                    type: 'order'
                });
            }
        });

        // Get recent user registrations
        const recentUsers = await User.find({ createdAt: { $gte: dateFilter } })
            .select('firstName lastName email avatar role createdAt')
            .sort({ createdAt: -1 })
            .limit(limit);

        recentUsers.forEach(user => {
            activities.push({
                id: `registration-${user._id}`,
                user: {
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
                    email: user.email,
                    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                    role: user.role === 'business_owner' ? 'vendor' : (user.role || 'customer')
                },
                action: 'Account created',
                details: `New ${user.role === 'business_owner' ? 'vendor' : user.role} registration`,
                timestamp: user.createdAt,
                type: 'registration'
            });
        });

        // Get recent business updates
        const recentBusinesses = await Business.find({ updatedAt: { $gte: dateFilter } })
            .select('name owner status createdAt updatedAt')
            .populate('owner', 'firstName lastName email avatar')
            .sort({ updatedAt: -1 })
            .limit(limit);

        recentBusinesses.forEach(business => {
            if (business.owner) {
                activities.push({
                    id: `business-${business._id}`,
                    user: {
                        name: business.name,
                        email: business.owner.email,
                        avatar: business.owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${business.name}`,
                        role: 'vendor'
                    },
                    action: business.status === 'pending' ? 'Submitted verification' : 'Updated business profile',
                    details: business.status === 'pending' ? 'Business documents uploaded for review' : 'Business information updated',
                    timestamp: business.updatedAt,
                    type: business.status === 'pending' ? 'verification' : 'update'
                });
            }
        });

        // Get recent reviews
        const recentReviews = await Review.find({ createdAt: { $gte: dateFilter } })
            .select('rating comment createdAt customer business order')
            .populate('customer', 'firstName lastName email avatar')
            .populate('business', 'name')
            .populate('order', 'orderNumber')
            .sort({ createdAt: -1 })
            .limit(limit);

        recentReviews.forEach(review => {
            if (review.customer) {
                activities.push({
                    id: `review-${review._id}`,
                    user: {
                        name: `${review.customer.firstName || ''} ${review.customer.lastName || ''}`.trim() || review.customer.email,
                        email: review.customer.email,
                        avatar: review.customer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.customer.email}`,
                        role: 'customer'
                    },
                    action: 'Left a review',
                    details: `${review.rating}-star review for ${review.business?.name || 'Unknown'}`,
                    timestamp: review.createdAt,
                    type: 'review'
                });
            }
        });

        // Sort all by timestamp
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Paginate
        const paginatedActivities = activities.slice(skip, skip + limit);

        res.json({
            activities: paginatedActivities,
            total: activities.length,
            currentPage: page,
            totalPages: Math.ceil(activities.length / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Get Admin Dashboard Stats
 * @route   GET /api/analytics/admin/stats
 * @access  Private (Admin)
 */
const getAdminStats = async (req, res) => {
    try {
        // Total users by role
        const totalUsers = await User.countDocuments();
        const consumers = await User.countDocuments({ role: 'consumer' });
        const vendors = await User.countDocuments({ role: 'business_owner' });
        const riders = await User.countDocuments({ role: 'rider' });

        // Active vs pending vendors
        const activeVendors = await Business.countDocuments({ status: 'approved' });
        const pendingVendors = await Business.countDocuments({ status: 'pending' });

        // Weekly growth
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const newUsersLastWeek = await User.countDocuments({
            createdAt: { $gte: twoWeeksAgo, $lt: weekAgo }
        });
        const weeklyChange = newUsersThisWeek - newUsersLastWeek;

        // Order stats
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } });

        // Revenue
        const revenueData = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        res.json({
            users: {
                total: totalUsers,
                consumers,
                vendors,
                riders,
                weeklyChange
            },
            businesses: {
                active: activeVendors,
                pending: pendingVendors
            },
            orders: {
                total: totalOrders,
                completed: completedOrders,
                pending: pendingOrders
            },
            revenue: {
                total: totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPlatformOverview,
    getBusinessOverview,
    getImpactLeaderboard,
    getMyImpact,
    getRecentActivity,
    getUserActivity,
    getAdminStats
};

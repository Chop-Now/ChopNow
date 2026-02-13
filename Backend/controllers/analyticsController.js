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
 * Environmental Impact Constants
 * Based on research data for food waste environmental impact
 */
const IMPACT_FACTORS = {
    CO2_PER_MEAL: 2.5,           // kg CO2e saved per meal rescued
    WATER_PER_MEAL: 1000,        // liters of water saved per meal
    AVG_MEAL_WEIGHT: 0.5,        // average kg per meal for food waste calculation
};

/**
 * @desc    Get my impact (Consumer/Business)
 * @route   GET /api/analytics/impact/my
 * @access  Private
 */
const getMyImpact = async (req, res) => {
    try {
        const userRole = req.user.activeRole || req.user.role;

        if (userRole === 'consumer') {
            // Get all completed orders for consumer
            const orders = await Order.find({
                customer: req.user._id,
                status: 'completed'
            }).sort({ createdAt: 1 });

            // Calculate total impact
            let totalMealsRescued = 0;
            let totalCo2Saved = 0;
            let totalWaterSaved = 0;
            let totalFoodWasteSaved = 0;

            orders.forEach(order => {
                order.items.forEach(item => {
                    const quantity = item.quantity || 1;
                    totalMealsRescued += quantity;
                    totalCo2Saved += (quantity * IMPACT_FACTORS.CO2_PER_MEAL);
                    totalWaterSaved += (quantity * IMPACT_FACTORS.WATER_PER_MEAL);
                    totalFoodWasteSaved += (quantity * IMPACT_FACTORS.AVG_MEAL_WEIGHT);
                });
            });

            // Calculate monthly breakdown for charts (last 12 months)
            const monthlyData = await calculateMonthlyImpact(req.user._id, 'consumer');

            // Calculate previous month for comparison
            const now = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            const thisMonthOrders = await Order.find({
                customer: req.user._id,
                status: 'completed',
                createdAt: { $gte: thisMonthStart }
            });

            const lastMonthOrders = await Order.find({
                customer: req.user._id,
                status: 'completed',
                createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
            });

            const thisMonthMeals = thisMonthOrders.reduce((sum, order) =>
                sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0), 0);
            const lastMonthMeals = lastMonthOrders.reduce((sum, order) =>
                sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0), 0);

            // Calculate percentage change
            const mealsChange = lastMonthMeals > 0
                ? ((thisMonthMeals - lastMonthMeals) / lastMonthMeals * 100).toFixed(1)
                : thisMonthMeals > 0 ? 100 : 0;

            res.json({
                mealsRescued: totalMealsRescued,
                co2Saved: Math.round(totalCo2Saved * 10) / 10,
                waterSaved: Math.round(totalWaterSaved),
                foodWasteSaved: Math.round(totalFoodWasteSaved * 10) / 10,
                ordersCount: orders.length,
                monthlyData,
                comparison: {
                    thisMonth: {
                        meals: thisMonthMeals,
                        co2: Math.round(thisMonthMeals * IMPACT_FACTORS.CO2_PER_MEAL * 10) / 10,
                        orders: thisMonthOrders.length
                    },
                    lastMonth: {
                        meals: lastMonthMeals,
                        co2: Math.round(lastMonthMeals * IMPACT_FACTORS.CO2_PER_MEAL * 10) / 10,
                        orders: lastMonthOrders.length
                    },
                    percentageChange: {
                        meals: parseFloat(mealsChange),
                        trend: parseFloat(mealsChange) >= 0 ? 'up' : 'down'
                    }
                }
            });
        } else if (userRole === 'business_owner' || userRole === 'manager') {
            const business = await Business.findOne({ owner: req.user._id });
            if (!business) {
                return res.status(404).json({ message: 'Business not found' });
            }

            // Calculate real impact from completed orders for this business
            const orders = await Order.find({
                business: business._id,
                status: 'completed'
            });

            let totalMealsRescued = 0;
            let totalCo2Saved = 0;
            let totalWaterSaved = 0;
            let totalFoodWasteSaved = 0;

            orders.forEach(order => {
                order.items.forEach(item => {
                    const quantity = item.quantity || 1;
                    totalMealsRescued += quantity;
                    totalCo2Saved += (quantity * IMPACT_FACTORS.CO2_PER_MEAL);
                    totalWaterSaved += (quantity * IMPACT_FACTORS.WATER_PER_MEAL);
                    totalFoodWasteSaved += (quantity * IMPACT_FACTORS.AVG_MEAL_WEIGHT);
                });
            });

            // Update business stats with real calculated values
            await Business.findByIdAndUpdate(business._id, {
                'stats.impact.co2Saved': totalCo2Saved,
                'stats.impact.mealsRescued': totalMealsRescued,
                'stats.impact.waterSaved': totalWaterSaved
            });

            // Calculate monthly breakdown
            const monthlyData = await calculateMonthlyImpact(business._id, 'business');

            res.json({
                mealsRescued: totalMealsRescued,
                co2Saved: Math.round(totalCo2Saved * 10) / 10,
                waterSaved: Math.round(totalWaterSaved),
                foodWasteSaved: Math.round(totalFoodWasteSaved * 10) / 10,
                ordersCount: orders.length,
                monthlyData
            });
        } else {
            res.status(400).json({ message: 'Invalid role for impact stats' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Calculate monthly impact data for the last 12 months
 * @param {ObjectId} id - User ID or Business ID
 * @param {string} type - 'consumer' or 'business'
 * @returns {Array} Monthly impact data
 */
const calculateMonthlyImpact = async (id, type) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyData = [];

    // Get data for last 12 months
    for (let i = 11; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const query = {
            status: 'completed',
            createdAt: { $gte: monthStart, $lte: monthEnd }
        };

        if (type === 'consumer') {
            query.customer = id;
        } else {
            query.business = id;
        }

        const orders = await Order.find(query);

        let meals = 0;
        orders.forEach(order => {
            order.items.forEach(item => {
                meals += item.quantity || 1;
            });
        });

        monthlyData.push({
            month: months[monthStart.getMonth()],
            year: monthStart.getFullYear(),
            meals,
            co2: Math.round(meals * IMPACT_FACTORS.CO2_PER_MEAL * 10) / 10,
            water: Math.round(meals * IMPACT_FACTORS.WATER_PER_MEAL),
            orders: orders.length
        });
    }

    return monthlyData;
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
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        // Total users by role
        const totalUsers = await User.countDocuments();
        const consumers = await User.countDocuments({ roles: 'consumer' });
        const vendors = await User.countDocuments({ roles: 'business_owner' });
        const riders = await User.countDocuments({ roles: 'rider' });

        // Users this month vs last month for percentage calculation
        const usersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonthStart } });
        const usersLastMonth = await User.countDocuments({
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });
        const usersPercentChange = usersLastMonth > 0
            ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
            : usersThisMonth > 0 ? 100 : 0;

        // Active vs pending vendors
        const activeVendors = await Business.countDocuments({ status: 'active' });
        const pendingVendors = await Business.countDocuments({ 'verification.status': 'pending' });

        // Vendors this month vs last month
        const vendorsThisMonth = await Business.countDocuments({ createdAt: { $gte: thisMonthStart } });
        const vendorsLastMonth = await Business.countDocuments({
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });
        const vendorsPercentChange = vendorsLastMonth > 0
            ? ((vendorsThisMonth - vendorsLastMonth) / vendorsLastMonth * 100).toFixed(1)
            : vendorsThisMonth > 0 ? 100 : 0;

        // Weekly growth
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
        const newUsersLastWeek = await User.countDocuments({
            createdAt: { $gte: twoWeeksAgo, $lt: weekAgo }
        });
        const weeklyChange = newUsersThisWeek - newUsersLastWeek;

        // Order stats
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const pendingOrders = await Order.countDocuments({ status: { $in: ['pending_payment', 'paid', 'confirmed', 'ready_for_pickup', 'out_for_delivery'] } });

        // Orders this month vs last month
        const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: thisMonthStart } });
        const ordersLastMonth = await Order.countDocuments({
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });
        const ordersPercentChange = ordersLastMonth > 0
            ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth * 100).toFixed(1)
            : ordersThisMonth > 0 ? 100 : 0;

        // Revenue calculations
        const revenueData = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Revenue this month vs last month
        const revenueThisMonthData = await Order.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: thisMonthStart } } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        const revenueLastMonthData = await Order.aggregate([
            { $match: { status: 'completed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        const revenueThisMonth = revenueThisMonthData.length > 0 ? revenueThisMonthData[0].total : 0;
        const revenueLastMonth = revenueLastMonthData.length > 0 ? revenueLastMonthData[0].total : 0;
        const revenuePercentChange = revenueLastMonth > 0
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
            : revenueThisMonth > 0 ? 100 : 0;

        // Calculate platform-wide impact
        const completedOrdersForImpact = await Order.find({ status: 'completed' });
        let totalMealsRescued = 0;
        let totalCo2Saved = 0;
        completedOrdersForImpact.forEach(order => {
            order.items.forEach(item => {
                totalMealsRescued += item.quantity || 1;
                totalCo2Saved += (item.quantity || 1) * IMPACT_FACTORS.CO2_PER_MEAL;
            });
        });

        // Impact this month vs last month
        const impactOrdersThisMonth = await Order.find({
            status: 'completed',
            createdAt: { $gte: thisMonthStart }
        });
        const impactOrdersLastMonth = await Order.find({
            status: 'completed',
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        });

        let co2ThisMonth = 0;
        let co2LastMonth = 0;
        impactOrdersThisMonth.forEach(order => {
            order.items.forEach(item => {
                co2ThisMonth += (item.quantity || 1) * IMPACT_FACTORS.CO2_PER_MEAL;
            });
        });
        impactOrdersLastMonth.forEach(order => {
            order.items.forEach(item => {
                co2LastMonth += (item.quantity || 1) * IMPACT_FACTORS.CO2_PER_MEAL;
            });
        });
        const co2PercentChange = co2LastMonth > 0
            ? ((co2ThisMonth - co2LastMonth) / co2LastMonth * 100).toFixed(1)
            : co2ThisMonth > 0 ? 100 : 0;

        // Average rating
        const ratingData = await Review.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        const avgRating = ratingData.length > 0 ? Math.round(ratingData[0].avgRating * 10) / 10 : 0;
        const reviewCount = ratingData.length > 0 ? ratingData[0].count : 0;

        // Weekly order trends for chart (last 4 weeks)
        const weeklyTrends = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - i * 7);

            const weekOrders = await Order.countDocuments({
                createdAt: { $gte: weekStart, $lt: weekEnd }
            });

            // Previous period (4 weeks before)
            const prevWeekStart = new Date(weekStart);
            prevWeekStart.setDate(prevWeekStart.getDate() - 28);
            const prevWeekEnd = new Date(weekEnd);
            prevWeekEnd.setDate(prevWeekEnd.getDate() - 28);

            const prevWeekOrders = await Order.countDocuments({
                createdAt: { $gte: prevWeekStart, $lt: prevWeekEnd }
            });

            weeklyTrends.push({
                name: `Week ${4 - i}`,
                thisMonth: weekOrders,
                lastMonth: prevWeekOrders
            });
        }

        res.json({
            users: {
                total: totalUsers,
                consumers,
                vendors,
                riders,
                weeklyChange,
                thisMonth: usersThisMonth,
                lastMonth: usersLastMonth,
                percentChange: parseFloat(usersPercentChange),
                trend: parseFloat(usersPercentChange) >= 0 ? 'up' : 'down'
            },
            businesses: {
                active: activeVendors,
                pending: pendingVendors,
                thisMonth: vendorsThisMonth,
                lastMonth: vendorsLastMonth,
                percentChange: parseFloat(vendorsPercentChange),
                trend: parseFloat(vendorsPercentChange) >= 0 ? 'up' : 'down'
            },
            orders: {
                total: totalOrders,
                completed: completedOrders,
                pending: pendingOrders,
                thisMonth: ordersThisMonth,
                lastMonth: ordersLastMonth,
                percentChange: parseFloat(ordersPercentChange),
                trend: parseFloat(ordersPercentChange) >= 0 ? 'up' : 'down'
            },
            revenue: {
                total: totalRevenue,
                thisMonth: revenueThisMonth,
                lastMonth: revenueLastMonth,
                percentChange: parseFloat(revenuePercentChange),
                trend: parseFloat(revenuePercentChange) >= 0 ? 'up' : 'down'
            },
            impact: {
                mealsRescued: totalMealsRescued,
                co2Saved: Math.round(totalCo2Saved * 10) / 10,
                co2ThisMonth: Math.round(co2ThisMonth * 10) / 10,
                co2LastMonth: Math.round(co2LastMonth * 10) / 10,
                percentChange: parseFloat(co2PercentChange),
                trend: parseFloat(co2PercentChange) >= 0 ? 'up' : 'down'
            },
            reviews: {
                avgRating,
                count: reviewCount
            },
            weeklyTrends
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

const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Business = require('../models/Business');
const User = require('../models/User');
const _Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const PlatformSettings = require('../models/PlatformSettings');
const logger = require('../utils/logger');
const {
  sendOrderConfirmationEmail,
  sendOrderReadyForPickupEmail,
  sendOrderOutForDeliveryEmail,
  sendOrderCompletedEmail,
  sendOrderCancelledEmail,
  sendVendorOrderNotification,
  sendVendorOrderCancelledEmail,
} = require('../utils/emailService');

// Impact constants (must match analyticsController.js)
const IMPACT_FACTORS = {
  CO2_PER_MEAL: 2.5, // kg CO2e saved per meal rescued
  WATER_PER_MEAL: 1000, // litres of water saved per meal
};
const socketManager = require('../socket');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (consumer, business_owner, admin)
 */
const createOrder = async (req, res) => {
  try {
    const { listing, items, fulfillmentType, deliveryDetails, pickupDetails, payment } = req.body;

    // Validation (before starting session)
    if (!listing || !items || !fulfillmentType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify listing exists and is available
    const listingDoc = await Listing.findById(listing).populate('business');
    if (!listingDoc) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (!listingDoc.isAvailable()) {
      return res.status(400).json({ message: 'Listing is not available' });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      item.title = item.title || item.name || listingDoc.title;
      item.unitPrice = item.unitPrice !== undefined ? item.unitPrice : listingDoc.pricing.price;
      item.subtotal = item.subtotal !== undefined ? item.subtotal : item.quantity * item.unitPrice;
      subtotal += item.subtotal;
    }

    let deliveryFee = 0;
    if (fulfillmentType === 'delivery') {
      if (listingDoc.fulfillment !== 'delivery') {
        return res.status(400).json({ message: 'Delivery not available for this listing' });
      }
      if (!deliveryDetails || !deliveryDetails.address) {
        return res.status(400).json({ message: 'Delivery address required for delivery orders' });
      }
      deliveryFee = listingDoc.business?.deliverySettings?.fee || 0;
    }

    // Get platform settings for commission calculation
    const platformSettings = await PlatformSettings.getSettings();
    const platformFeePercent = platformSettings.platformFeePercent || 10;
    const platformFee = Math.round((subtotal * platformFeePercent) / 100);
    const vendorAmount = subtotal - platformFee;
    const total = subtotal + deliveryFee;

    // --- Transaction: reserve inventory, create order, update stats atomically ---
    const session = await mongoose.startSession();
    let order;
    try {
      await session.withTransaction(async () => {
        // Reserve inventory atomically
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const updated = await Listing.findOneAndUpdate(
          { _id: listingDoc._id, 'inventory.quantity': { $gte: totalQuantity } },
          {
            $inc: {
              'inventory.quantity': -totalQuantity,
              'inventory.reserved': totalQuantity,
              'stats.orders': 1,
            },
          },
          { session, new: true }
        );
        if (!updated) {
          throw new Error('Not enough stock available');
        }
        if (updated.inventory.quantity === 0) {
          updated.status = 'sold_out';
          await updated.save({ session });
        }

        // Create order
        [order] = await Order.create(
          [
            {
              customer: req.user._id,
              business: listingDoc.business._id,
              listing: listingDoc._id,
              items,
              pricing: {
                subtotal,
                deliveryFee,
                platformFee,
                platformFeePercent,
                vendorAmount,
                total,
                currency: listingDoc.pricing.currency,
              },
              fulfillmentType,
              deliveryDetails,
              pickupDetails:
                fulfillmentType === 'pickup'
                  ? {
                      ...pickupDetails,
                      pickupCode: crypto
                        .randomBytes(4)
                        .toString('hex')
                        .substring(0, 6)
                        .toUpperCase(),
                    }
                  : undefined,
              payment,
            },
          ],
          { session }
        );

        // Update user stats
        await User.findByIdAndUpdate(
          req.user._id,
          {
            $inc: { 'stats.ordersCount': 1 },
          },
          { session }
        );

        // Update business stats
        await Business.findByIdAndUpdate(
          listingDoc.business._id,
          {
            $inc: { 'stats.totalOrders': 1 },
          },
          { session }
        );
      });
    } finally {
      session.endSession();
    }

    // --- Post-transaction: notifications and emails ---
    const isCashOrder = order.payment?.paymentMethod === 'cash';

    if (isCashOrder) {
      // Send vendor notifications and customer emails immediately
      await sendNewOrderNotifications(order._id);
    } else {
      // For mobile money/card, just notify customer of order placement pending payment
      try {
        const io = socketManager.getIO();
        io.to(`user_${order.customer.toString()}`).emit('order_status_updated', order);
      } catch (socketErr) {
        logger.error({ err: socketErr }, 'Failed to emit socket order_status_updated event');
      }
    }

    res.status(201).json(order);
  } catch (error) {
    logger.error({ err: error }, 'Create order failed');
    const statusCode = error.message === 'Not enough stock available' ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

/**
 * Reusable helper to send all vendor & customer notifications once an order is valid/paid
 */
const sendNewOrderNotifications = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('listing').populate('business');
    if (!order) {
      logger.error({ orderId }, 'sendNewOrderNotifications failed: Order not found');
      return;
    }

    const listingDoc = order.listing;
    const businessForNotif = await Business.findById(order.business).populate('owner');
    const customer = await User.findById(order.customer);
    if (!customer) return;

    const customerName =
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
    const deliveryAddr =
      order.fulfillmentType === 'delivery' && order.deliveryDetails?.address
        ? typeof order.deliveryDetails.address === 'string'
          ? order.deliveryDetails.address
          : `${order.deliveryDetails.address.street || ''}, ${order.deliveryDetails.address.city || ''}`.trim()
        : null;

    // 1. Create notification for customer with rich metadata
    await Notification.createNotification({
      user: customer._id,
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber} has been placed successfully`,
      type: 'order_confirmed',
      relatedOrder: order._id,
      relatedBusiness: order.business,
      link: '/my-orders',
      metadata: {
        orderNumber: order.orderNumber,
        orderTotal: order.pricing.total,
        currency: order.pricing.currency,
        fulfillmentType: order.fulfillmentType,
        pickupCode: order.pickupDetails?.pickupCode,
        deliveryAddress: deliveryAddr,
        businessName: businessForNotif?.name || 'Vendor',
        businessLogo: businessForNotif?.media?.logo,
        listingTitle: listingDoc?.title,
        listingImage: listingDoc?.photos?.[0],
      },
    });

    // 2. Create notification for vendor with rich metadata
    if (businessForNotif && businessForNotif.owner) {
      await Notification.createNotification({
        user: businessForNotif.owner._id,
        title: 'New Order Received',
        message: `New order #${order.orderNumber} from ${customerName}`,
        type: 'new_order',
        relatedOrder: order._id,
        relatedBusiness: businessForNotif._id,
        link: '/dashboard',
        metadata: {
          orderNumber: order.orderNumber,
          orderTotal: order.pricing.total,
          currency: order.pricing.currency,
          fulfillmentType: order.fulfillmentType,
          deliveryAddress: deliveryAddr,
          customerName,
          listingTitle: listingDoc?.title,
          listingImage: listingDoc?.photos?.[0],
          actionLabel: 'View Order',
          actionUrl: '/dashboard',
        },
      });
    }

    // 3. EMAIL: Order confirmation to customer
    if (customer.preferences?.notifications?.email) {
      sendOrderConfirmationEmail(customer.email, customerName, order).catch((err) =>
        logger.error({ err }, 'Failed to send order confirmation email')
      );
    }

    // 4. EMAIL: Vendor notification
    if (businessForNotif && businessForNotif.owner) {
      const vendorUser = await User.findById(businessForNotif.owner._id)
        .select('email preferences')
        .lean();
      if (vendorUser && vendorUser.preferences?.notifications?.email !== false) {
        sendVendorOrderNotification(vendorUser.email, businessForNotif.name, order).catch((err) =>
          logger.error({ err }, 'Failed to send vendor order notification email')
        );
      }
    }

    // 5. --- WebSockets: Emit new order to vendor ---
    try {
      const io = socketManager.getIO();
      if (businessForNotif) {
        io.to(`business_${businessForNotif._id.toString()}`).emit('new_order', order);
      }
    } catch (socketErr) {
      logger.error({ err: socketErr }, 'Failed to emit socket new_order event');
    }
  } catch (error) {
    logger.error({ err: error, orderId }, 'Error running sendNewOrderNotifications helper');
  }
};

/**
 * @desc    Get all orders (with filters)
 * @route   GET /api/orders
 * @access  Private
 */
const getOrders = async (req, res) => {
  try {
    const { status, fulfillmentType } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Role-based filtering
    const filterRole = req.query.role || req.user.role;
    if (filterRole === 'business_owner') {
      const businesses = await Business.find({ owner: req.user._id }).select('_id').lean();
      query.business = { $in: businesses.map((b) => b._id) };
    } else if (filterRole === 'admin') {
      if (req.query.role === 'consumer') {
        query.customer = req.user._id;
      }
    } else {
      query.customer = req.user._id;
    }

    if (status) {
      if (status === 'pending') {
        query.status = {
          $in: ['pending_payment', 'paid', 'confirmed', 'ready_for_pickup', 'out_for_delivery'],
        };
      } else if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }
    if (fulfillmentType) query.fulfillmentType = fulfillmentType;

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('business', 'name type address contact')
      .populate('listing', 'title category photos')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('business', 'name type address contact media location')
      .populate('listing', 'title category photos pricing')
      .populate('delivery')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isBusinessOwner = req.user.role === 'business_owner';
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isBusinessOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (business owner, admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    const order = await Order.findById(req.params.id).populate('business');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const businessDoc = await Business.findById(order.business._id);
    if (businessDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await order.updateStatus(status);

    // Get related data for rich notifications
    const listing = await Listing.findById(order.listing);
    const deliveryAddr =
      order.fulfillmentType === 'delivery' && order.deliveryDetails?.address
        ? `${order.deliveryDetails.address.street || ''}, ${order.deliveryDetails.address.city || ''}`.trim()
        : null;

    // Create notifications with rich metadata based on status
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'other';

    switch (status) {
      case 'confirmed':
        notificationTitle = 'Order Confirmed by Vendor';
        notificationMessage = `${businessDoc.name} is preparing your order #${order.orderNumber}`;
        notificationType = 'order_confirmed';
        break;
      case 'ready_for_pickup':
        notificationTitle = 'Order Ready for Pickup!';
        notificationMessage = `Your order #${order.orderNumber} is ready. Show code: ${order.pickupDetails?.pickupCode}`;
        notificationType = 'order_ready';
        break;
      case 'out_for_delivery':
        notificationTitle = 'Order Out for Delivery';
        notificationMessage = `Your order #${order.orderNumber} is on its way to you`;
        notificationType = 'order_out_for_delivery';
        break;
      case 'completed': {
        notificationTitle = 'Order Completed';
        notificationMessage = `Thank you! Your order #${order.orderNumber} has been completed`;
        notificationType = 'order_completed';

        // Update user stats
        await User.findByIdAndUpdate(order.customer, {
          $inc: { 'stats.totalSpent': order.pricing.total },
        });

        // Update impact metrics on business — increment based on items quantity
        const totalMealsCompleted = order.items.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        const co2Increment = totalMealsCompleted * IMPACT_FACTORS.CO2_PER_MEAL;
        const waterIncrement = totalMealsCompleted * IMPACT_FACTORS.WATER_PER_MEAL;
        await Business.findByIdAndUpdate(order.business._id || order.business, {
          $inc: {
            'stats.impact.mealsRescued': totalMealsCompleted,
            'stats.impact.co2Saved': co2Increment,
            'stats.impact.waterSaved': waterIncrement,
            'metrics.mealsSaved': totalMealsCompleted,
            'metrics.co2Saved': co2Increment,
          },
        });
        break;
      }
    }

    if (notificationTitle) {
      // Create rich notification
      await Notification.createNotification({
        user: order.customer,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        relatedOrder: order._id,
        relatedBusiness: businessDoc._id,
        link: '/my-orders',
        metadata: {
          orderNumber: order.orderNumber,
          orderTotal: order.pricing.total,
          currency: order.pricing.currency,
          fulfillmentType: order.fulfillmentType,
          pickupCode: order.pickupDetails?.pickupCode,
          deliveryAddress: deliveryAddr,
          businessName: businessDoc.name,
          businessLogo: businessDoc.media?.logo,
          listingTitle: listing?.title,
          listingImage: listing?.photos?.[0],
          actionLabel: status === 'ready_for_pickup' ? 'View Pickup Code' : 'View Order',
          actionUrl: '/my-orders',
        },
      });

      // EMAIL STRATEGY: Only send emails for TIME-SENSITIVE actions
      // - ready_for_pickup: User MUST act (go pick up food before it spoils)
      // Other statuses: In-app notification is sufficient
      const customer = await User.findById(order.customer);
      if (customer && customer.preferences?.notifications?.email) {
        const customerName =
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;

        if (status === 'ready_for_pickup') {
          // ESSENTIAL EMAIL: User needs to act NOW (food is ready, may spoil)
          sendOrderReadyForPickupEmail(customer.email, customerName, order).catch((err) =>
            logger.error({ err }, 'Failed to send pickup ready email')
          );
        } else if (status === 'out_for_delivery') {
          // ESSENTIAL EMAIL: Rider is on the way, customer should be home
          sendOrderOutForDeliveryEmail(customer.email, customerName, order).catch((err) =>
            logger.error({ err }, 'Failed to send out for delivery email')
          );
        } else if (status === 'completed') {
          // NICE-TO-HAVE: Completion + review prompt
          sendOrderCompletedEmail(customer.email, customerName, order).catch((err) =>
            logger.error({ err }, 'Failed to send order completed email')
          );
        }
      }
    }

    // --- WebSockets: Emit status update to customer and vendor ---
    try {
      const io = socketManager.getIO();
      // Inform customer
      io.to(`user_${order.customer.toString()}`).emit('order_status_updated', order);
      // Inform vendor
      io.to(`business_${order.business._id.toString()}`).emit('order_status_updated', order);
    } catch (socketErr) {
      logger.error({ err: socketErr }, 'Failed to emit socket order_status_updated event');
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('listing');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }

    // --- Transaction: restore inventory + cancel order atomically ---
    let listing;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        listing = await Listing.findById(order.listing._id).session(session);
        if (listing) {
          listing.inventory.quantity += totalQuantity;
          listing.inventory.reserved -= totalQuantity;
          if (listing.status === 'sold_out' && listing.inventory.quantity > 0) {
            listing.status = 'active';
          }
          await listing.save({ session });
        }

        await order.updateStatus('cancelled');
        await order.save({ session });
      });
    } finally {
      session.endSession();
    }

    // --- Post-transaction: notifications (non-critical) ---

    // Get business and customer info for notifications
    const business = await Business.findById(order.business).populate('owner');
    const customer = await User.findById(order.customer);
    const customerName = customer
      ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer'
      : 'Customer';

    // Create notification for customer with rich metadata
    await Notification.createNotification({
      user: order.customer,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled`,
      type: 'order_cancelled',
      relatedOrder: order._id,
      relatedBusiness: order.business,
      link: '/my-orders',
      metadata: {
        orderNumber: order.orderNumber,
        orderTotal: order.pricing.total,
        currency: order.pricing.currency,
        businessName: business?.name || 'Vendor',
        businessLogo: business?.media?.logo,
        listingTitle: listing?.title,
        listingImage: listing?.photos?.[0],
        actionLabel: 'View Details',
        actionUrl: '/my-orders',
      },
    });

    // Create notification for vendor with rich metadata
    if (business && business.owner) {
      await Notification.createNotification({
        user: business.owner._id,
        title: 'Order Cancelled',
        message: `Order #${order.orderNumber} was cancelled by ${customerName}`,
        type: 'order_cancelled',
        relatedOrder: order._id,
        relatedBusiness: business._id,
        link: '/dashboard',
        metadata: {
          orderNumber: order.orderNumber,
          orderTotal: order.pricing.total,
          currency: order.pricing.currency,
          customerName,
          listingTitle: listing?.title,
          listingImage: listing?.photos?.[0],
          actionLabel: 'View Orders',
          actionUrl: '/dashboard',
        },
      });
    }
    // EMAIL: Cancellation emails to both customer and vendor
    if (customer && customer.preferences?.notifications?.email !== false) {
      sendOrderCancelledEmail(customer.email, customerName, order).catch((err) =>
        logger.error({ err }, 'Failed to send order cancelled email to customer')
      );
    }
    if (business && business.owner) {
      const vendorOwner = await User.findById(business.owner._id)
        .select('email preferences')
        .lean();
      if (vendorOwner && vendorOwner.preferences?.notifications?.email !== false) {
        sendVendorOrderCancelledEmail(vendorOwner.email, business.name, order, customerName).catch(
          (err) => logger.error({ err }, 'Failed to send order cancelled email to vendor')
        );
      }
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    logger.error({ err: error }, 'Cancel order failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Verify pickup code
 * @route   POST /api/orders/:id/verify-pickup
 * @access  Private (business owner, admin)
 */
const verifyPickupCode = async (req, res) => {
  try {
    const { pickupCode } = req.body;

    const order = await Order.findById(req.params.id).populate('business');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    const businessDoc = await Business.findById(order.business._id);
    if (businessDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.fulfillmentType !== 'pickup') {
      return res.status(400).json({ message: 'This is not a pickup order' });
    }

    if (order.pickupDetails.pickupCode !== pickupCode) {
      return res.status(400).json({ message: 'Invalid pickup code' });
    }

    order.pickupDetails.pickedUpAt = new Date();
    await order.updateStatus('completed');

    // Impact metrics update on pickup completion
    const totalMealsPickup = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const co2IncrementPickup = totalMealsPickup * IMPACT_FACTORS.CO2_PER_MEAL;
    const waterIncrementPickup = totalMealsPickup * IMPACT_FACTORS.WATER_PER_MEAL;
    Business.findByIdAndUpdate(order.business._id || order.business, {
      $inc: {
        'stats.impact.mealsRescued': totalMealsPickup,
        'stats.impact.co2Saved': co2IncrementPickup,
        'stats.impact.waterSaved': waterIncrementPickup,
        'metrics.mealsSaved': totalMealsPickup,
        'metrics.co2Saved': co2IncrementPickup,
      },
    }).catch((err) => logger.error({ err }, 'Failed to update impact metrics on pickup'));

    // Email customer their completion summary + review prompt
    const customer = await User.findById(order.customer)
      .select('email firstName lastName preferences')
      .lean();
    if (customer && customer.preferences?.notifications?.email !== false) {
      const customerName =
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;
      sendOrderCompletedEmail(customer.email, customerName, order).catch((err) =>
        logger.error({ err }, 'Failed to send order completed email on pickup verify')
      );
    }

    // Update user total spent stats
    await User.findByIdAndUpdate(order.customer, {
      $inc: { 'stats.totalSpent': order.pricing.total },
    });

    res.json({ message: 'Pickup verified successfully', order });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Verify pickup code directly (without order ID)
 * @route   POST /api/orders/verify-pickup-code
 * @access  Private (business owner, admin)
 */
const verifyPickupCodeDirect = async (req, res) => {
  try {
    const { pickupCode } = req.body;

    if (!pickupCode) {
      return res.status(400).json({ message: 'Please provide pickup code' });
    }

    // Find businesses owned by this user
    let allowedBusinesses = [];
    if (req.user.role === 'business_owner') {
      const businesses = await Business.find({ owner: req.user._id }).select('_id').lean();
      allowedBusinesses = businesses.map((b) => b._id.toString());
    }

    // Query active pickup orders
    const query = {
      fulfillmentType: 'pickup',
      'pickupDetails.pickupCode': pickupCode,
      status: { $in: ['paid', 'confirmed', 'ready_for_pickup'] },
    };

    if (req.user.role === 'business_owner') {
      query.business = { $in: allowedBusinesses };
    }

    const order = await Order.findOne(query).populate('business');

    if (!order) {
      return res.status(404).json({ message: 'Active order with this pickup code not found' });
    }

    order.pickupDetails.pickedUpAt = new Date();
    await order.updateStatus('completed');

    // Update impact metrics on business
    const totalMealsPickup = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const co2IncrementPickup = totalMealsPickup * IMPACT_FACTORS.CO2_PER_MEAL;
    const waterIncrementPickup = totalMealsPickup * IMPACT_FACTORS.WATER_PER_MEAL;

    await Business.findByIdAndUpdate(order.business._id || order.business, {
      $inc: {
        'stats.impact.mealsRescued': totalMealsPickup,
        'stats.impact.co2Saved': co2IncrementPickup,
        'stats.impact.waterSaved': waterIncrementPickup,
        'metrics.mealsSaved': totalMealsPickup,
        'metrics.co2Saved': co2IncrementPickup,
      },
    }).catch((err) => logger.error({ err }, 'Failed to update impact metrics on pickup'));

    // Email customer
    const customer = await User.findById(order.customer)
      .select('email firstName lastName preferences')
      .lean();
    if (customer && customer.preferences?.notifications?.email !== false) {
      const customerName =
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;
      sendOrderCompletedEmail(customer.email, customerName, order).catch((err) =>
        logger.error({ err }, 'Failed to send order completed email on pickup verify')
      );
    }

    // Update user total spent stats
    await User.findByIdAndUpdate(order.customer, {
      $inc: { 'stats.totalSpent': order.pricing.total },
    });

    res.json({
      message: 'Pickup verified and order completed successfully',
      order: {
        _id: order.orderNumber || order._id,
        orderId: order._id,
        customerName: customer
          ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
          : 'Customer',
        total: order.pricing.total,
        status: 'Completed',
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Direct verify pickup failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get all orders (admin only)
 * @route   GET /api/orders/admin
 * @access  Private (admin)
 */
const getAdminOrders = async (req, res) => {
  try {
    const { status, fulfillmentType, business, customer } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    if (status) {
      if (status === 'pending') {
        query.status = {
          $in: ['pending_payment', 'paid', 'confirmed', 'ready_for_pickup', 'out_for_delivery'],
        };
      } else if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }
    if (fulfillmentType) query.fulfillmentType = fulfillmentType;
    if (business) query.business = business;
    if (customer) query.customer = customer;

    const orders = await Order.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('business', 'name type address contact')
      .populate('listing', 'title category photos')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  verifyPickupCode,
  verifyPickupCodeDirect,
  getAdminOrders,
  sendNewOrderNotifications,
};

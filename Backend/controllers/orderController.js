const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Business = require('../models/Business');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const PlatformSettings = require('../models/PlatformSettings');
const logger = require('../utils/logger');
const {
  sendOrderConfirmationEmail,
  sendOrderReadyForPickupEmail,
} = require('../utils/emailService');

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
      subtotal += item.quantity * item.unitPrice;
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

    // --- Post-transaction: notifications and emails (non-critical, outside transaction) ---

    // Get business info for notifications
    const businessForNotif = await Business.findById(listingDoc.business._id).populate('owner');
    const customerName =
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Customer';
    const deliveryAddr =
      fulfillmentType === 'delivery' && deliveryDetails?.address
        ? `${deliveryDetails.address.street || ''}, ${deliveryDetails.address.city || ''}`.trim()
        : null;

    // Create notification for customer with rich metadata
    await Notification.createNotification({
      user: req.user._id,
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber} has been placed successfully`,
      type: 'order_confirmed',
      relatedOrder: order._id,
      relatedBusiness: listingDoc.business._id,
      link: '/my-orders',
      metadata: {
        orderNumber: order.orderNumber,
        orderTotal: order.pricing.total,
        currency: order.pricing.currency,
        fulfillmentType,
        pickupCode: order.pickupDetails?.pickupCode,
        deliveryAddress: deliveryAddr,
        businessName: businessForNotif?.name || 'Vendor',
        businessLogo: businessForNotif?.media?.logo,
        listingTitle: listingDoc.title,
        listingImage: listingDoc.photos?.[0],
      },
    });

    // Create notification for vendor with rich metadata
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
          fulfillmentType,
          deliveryAddress: deliveryAddr,
          customerName,
          listingTitle: listingDoc.title,
          listingImage: listingDoc.photos?.[0],
          actionLabel: 'View Order',
          actionUrl: '/dashboard',
        },
      });
    }

    // EMAIL: Order confirmation is ESSENTIAL (serves as receipt)
    const customer = await User.findById(req.user._id);
    if (customer && customer.preferences?.notifications?.email) {
      sendOrderConfirmationEmail(customer.email, customerName, order).catch((err) =>
        logger.error({ err }, 'Failed to send order confirmation email')
      );
    }
    // NOTE: Vendor gets in-app notification only (they check dashboard regularly)

    res.status(201).json(order);
  } catch (error) {
    logger.error({ err: error }, 'Create order failed');
    const statusCode = error.message === 'Not enough stock available' ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
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

    let query = {};

    // Role-based filtering
    if (req.user.role === 'consumer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'business_owner') {
      const businesses = await Business.find({ owner: req.user._id }).select('_id').lean();
      query.business = { $in: businesses.map((b) => b._id) };
    }
    // Admin can see all orders

    if (status) query.status = status;
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
      .populate('business', 'name type address contact media')
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
      case 'completed':
        notificationTitle = 'Order Completed';
        notificationMessage = `Thank you! Your order #${order.orderNumber} has been completed`;
        notificationType = 'order_completed';

        // Update user stats
        await User.findByIdAndUpdate(order.customer, {
          $inc: { 'stats.totalSpent': order.pricing.total },
        });
        break;
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
          // ESSENTIAL EMAIL: User needs to act NOW
          sendOrderReadyForPickupEmail(customer.email, customerName, order).catch((err) =>
            logger.error({ err }, 'Failed to send pickup ready email')
          );
        }
      }
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
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const listing = await Listing.findById(order.listing._id).session(session);
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
    // NOTE: No email for cancellation - in-app notification is sufficient

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

    res.json({ message: 'Pickup verified successfully', order });
  } catch (error) {
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

    let query = {};

    if (status) query.status = status;
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
  getAdminOrders,
};

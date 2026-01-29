const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Business = require('../models/Business');
const User = require('../models/User');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendVendorOrderNotification,
} = require('../utils/emailService');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (consumer, business_owner, admin)
 */
const createOrder = async (req, res) => {
  try {
    const {
      listing,
      items,
      fulfillmentType,
      deliveryDetails,
      pickupDetails,
      payment
    } = req.body;

    // Validation
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
      if (!listingDoc.fulfillment.deliveryEnabled) {
        return res.status(400).json({ message: 'Delivery not available for this listing' });
      }
      if (!deliveryDetails || !deliveryDetails.address) {
        return res.status(400).json({ message: 'Delivery address required for delivery orders' });
      }
      deliveryFee = listingDoc.business.deliverySettings.fee || 0;
    }

    const total = subtotal + deliveryFee;

    // Reserve inventory
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    await listingDoc.reserveQuantity(totalQuantity);

    // Create order
    const order = await Order.create({
      customer: req.user._id,
      business: listingDoc.business._id,
      listing: listingDoc._id,
      items,
      pricing: {
        subtotal,
        deliveryFee,
        total,
        currency: listingDoc.pricing.currency
      },
      fulfillmentType,
      deliveryDetails,
      pickupDetails: fulfillmentType === 'pickup' ? {
        ...pickupDetails,
        pickupCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      } : undefined,
      payment
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.ordersCount': 1 }
    });

    // Update business stats
    await Business.findByIdAndUpdate(listingDoc.business._id, {
      $inc: { 'stats.totalOrders': 1 }
    });

    // Update listing stats
    listingDoc.stats.orders += 1;
    await listingDoc.save();

    // Create notification
    await Notification.createNotification({
      user: req.user._id,
      title: 'Order Created',
      message: `Your order ${order.orderNumber} has been created`,
      type: 'order_confirmed',
      relatedOrder: order._id
    });

    // Send order confirmation email to customer
    const customer = await User.findById(req.user._id);
    if (customer && customer.preferences?.notifications?.email) {
      sendOrderConfirmationEmail(
        customer.email,
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
        order
      ).catch((err) => console.error('Failed to send order confirmation email:', err));
    }

    // Send notification email to vendor
    const business = await Business.findById(listingDoc.business._id).populate('owner');
    if (business && business.owner) {
      const owner = await User.findById(business.owner._id);
      if (owner && owner.preferences?.notifications?.email) {
        sendVendorOrderNotification(
          owner.email,
          business.name || 'Your business',
          order
        ).catch((err) => console.error('Failed to send vendor order notification:', err));
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      const businesses = await Business.find({ owner: req.user._id }).select('_id');
      query.business = { $in: businesses.map(b => b._id) };
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
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      .populate('delivery');

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
    res.status(500).json({ message: error.message });
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

    // Create notifications based on status
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'other';

    switch (status) {
      case 'confirmed':
        notificationTitle = 'Order Confirmed';
        notificationMessage = `Your order ${order.orderNumber} has been confirmed`;
        notificationType = 'order_confirmed';
        break;
      case 'ready_for_pickup':
        notificationTitle = 'Order Ready';
        notificationMessage = `Your order ${order.orderNumber} is ready for pickup`;
        notificationType = 'order_ready';
        break;
      case 'out_for_delivery':
        notificationTitle = 'Out for Delivery';
        notificationMessage = `Your order ${order.orderNumber} is out for delivery`;
        notificationType = 'order_out_for_delivery';
        break;
      case 'completed':
        notificationTitle = 'Order Completed';
        notificationMessage = `Your order ${order.orderNumber} has been completed`;
        notificationType = 'order_completed';
        
        // Update user stats
        await User.findByIdAndUpdate(order.customer, {
          $inc: { 'stats.totalSpent': order.pricing.total }
        });
        break;
    }

    if (notificationTitle) {
      await Notification.createNotification({
        user: order.customer,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        relatedOrder: order._id
      });

      // Send email to customer on status update
      const customer = await User.findById(order.customer);
      if (customer && customer.preferences?.notifications?.email) {
        sendOrderStatusUpdateEmail(
          customer.email,
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
          order,
          status
        ).catch((err) => console.error('Failed to send order status update email:', err));
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // Restore inventory
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const listing = await Listing.findById(order.listing._id);
    if (listing) {
      listing.inventory.quantityAvailable += totalQuantity;
      listing.inventory.quantityReserved -= totalQuantity;
      if (listing.status === 'sold_out' && listing.inventory.quantityAvailable > 0) {
        listing.status = 'active';
      }
      await listing.save();
    }

    await order.updateStatus('cancelled');

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  verifyPickupCode
};

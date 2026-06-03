const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const logger = require('../utils/logger');
const { verifySignature } = require('../utils/pawapaySignatures');
const { sendNewOrderNotifications } = require('./orderController');
const socketManager = require('../socket');

/**
 * @desc    Initiate mobile money payment (deposit) via pawaPay
 * @route   POST /api/payments/deposit
 * @access  Private
 */
const initiatePayment = async (req, res) => {
  try {
    const { orderId, phoneNumber, correspondent } = req.body;

    if (!orderId || !phoneNumber || !correspondent) {
      return res
        .status(400)
        .json({ message: 'Please provide orderId, phoneNumber, and correspondent' });
    }

    if (!['MTN_MOMO_RWA', 'AIRTEL_RWA'].includes(correspondent)) {
      return res
        .status(400)
        .json({ message: 'Invalid correspondent. Must be MTN_MOMO_RWA or AIRTEL_RWA' });
    }

    // Clean phone number to MSISDN format (e.g., must start with country code, no +, no spaces)
    let formattedPhone = phoneNumber.replace(/[\s+]/g, '');
    if (formattedPhone.startsWith('0')) {
      // Assuming Rwandan number if starts with 0
      formattedPhone = '250' + formattedPhone.substring(1);
    }
    if (!formattedPhone.startsWith('250') || formattedPhone.length !== 12) {
      return res.status(400).json({
        message: 'Phone number must be a valid Rwandan number (e.g., 25078xxxxxxx or 078xxxxxxx)',
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Authorize check: order must belong to caller
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    // Order must be pending payment
    if (order.status !== 'pending_payment') {
      return res
        .status(400)
        .json({ message: `Order status is ${order.status}. Cannot initiate payment.` });
    }

    // Generate depositId (UUIDv4)
    const depositId = crypto.randomUUID();

    // Configure pawaPay API details
    const isProduction = process.env.PAWAPAY_ENVIRONMENT === 'production';
    const baseUrl = isProduction ? 'https://api.pawapay.io' : 'https://api.sandbox.pawapay.io';
    const apiKey = process.env.PAWAPAY_API_KEY;

    if (!apiKey) {
      logger.error('PAWAPAY_API_KEY is not configured in environment variables.');
      return res.status(500).json({ message: 'Payment gateway configuration error' });
    }

    const payload = {
      depositId: depositId,
      amount: String(order.pricing.total),
      currency: order.pricing.currency || 'RWF',
      country: 'RWA',
      correspondent: correspondent,
      payer: {
        address: {
          value: formattedPhone,
        },
      },
      customerTimestamp: new Date().toISOString(),
      statementDescription: `ChopNow Order ${order.orderNumber.substring(0, 15)}`,
    };

    logger.debug({ payload }, 'Initiating pawaPay deposit request');

    // Call pawaPay Deposits API
    const response = await axios.post(`${baseUrl}/v2/deposits`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Idempotency-Key': depositId, // Prevents double-charges on retries
      },
      timeout: 10000,
    });

    logger.debug({ response: response.data }, 'pawaPay deposit initiation response');

    // Verify response
    if (response.data && response.data.status === 'ACCEPTED') {
      // Create a Payment record
      const payment = await Payment.create({
        order: order._id,
        depositId: depositId,
        amount: order.pricing.total,
        currency: order.pricing.currency || 'RWF',
        payerPhoneNumber: formattedPhone,
        correspondent: correspondent,
        status: 'pending',
      });

      // Update order status/method references quietly
      order.payment.paymentMethod = 'mobile_money';
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Payment initiated successfully. Please complete PIN prompt on your phone.',
        depositId: depositId,
        paymentId: payment._id,
      });
    } else {
      logger.error({ responseData: response.data }, 'pawaPay deposit not accepted');
      return res.status(400).json({
        message: 'Payment initiation rejected by pawaPay',
        details: response.data,
      });
    }
  } catch (error) {
    logger.error({ err: error.response?.data || error.message }, 'pawaPay initiation failed');
    return res.status(500).json({
      message: 'Failed to initiate mobile money payment',
      error: error.response?.data?.message || error.message,
    });
  }
};

/**
 * @desc    Handle pawaPay webhook callbacks
 * @route   POST /api/payments/webhook
 * @access  Public
 */
const handleWebhook = async (req, res) => {
  try {
    logger.info({ body: req.body, headers: req.headers }, 'pawaPay Webhook Received');

    // 1. Verify cryptographic signature (RFC-9421)
    const isValidSignature = await verifySignature(req);
    if (!isValidSignature) {
      logger.error('pawaPay callback rejected: Invalid cryptographic signature.');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { depositId, status, failureReason, providerTransactionId } = req.body;

    if (!depositId || !status) {
      return res.status(400).json({ error: 'Missing depositId or status' });
    }

    // 2. Find matching Payment
    const payment = await Payment.findOne({ depositId });
    if (!payment) {
      logger.warn({ depositId }, 'pawaPay callback received for untracked payment ID.');
      // Still return 200 OK so pawaPay stops retrying
      return res.status(200).json({ message: 'Callback ignored: payment untracked' });
    }

    // Avoid double processing
    if (payment.callbackReceived && payment.status !== 'pending') {
      logger.info({ depositId }, 'pawaPay callback already processed for this transaction.');
      return res.status(200).json({ message: 'Duplicate callback ignored' });
    }

    // 3. Update Payment record
    payment.status = status === 'COMPLETED' ? 'completed' : 'failed';
    payment.callbackReceived = true;
    payment.rawCallbackData = req.body;
    if (providerTransactionId) {
      payment.providerTransactionId = providerTransactionId;
    }
    if (failureReason) {
      payment.failureReason = {
        code: failureReason.code,
        description: failureReason.description,
      };
    }
    await payment.save();

    // 4. Update corresponding Order using a session to handle inventory release atomically if failed
    const session = await mongoose.startSession();
    let orderToNotify = null;
    let notificationStatus = null; // 'COMPLETED' or 'FAILED'

    try {
      await session.withTransaction(async () => {
        const order = await Order.findById(payment.order).session(session);
        if (!order) {
          logger.error({ orderId: payment.order }, 'Matching order for payment callback not found');
          return;
        }

        if (status === 'COMPLETED') {
          // Update Order to PAID
          order.status = 'paid';
          order.payment.paymentStatus = 'completed';
          if (!order.statusTimestamps.paidAt) {
            order.statusTimestamps.paidAt = new Date();
          }
          await order.save({ session });

          orderToNotify = order;
          notificationStatus = 'COMPLETED';

          logger.info(
            { orderNumber: order.orderNumber, depositId },
            'Order marked as paid via pawaPay callback.'
          );
        } else {
          // Payment failed: mark Order as cancelled and release listing stock
          order.status = 'cancelled';
          order.payment.paymentStatus = 'failed';
          if (!order.statusTimestamps.cancelledAt) {
            order.statusTimestamps.cancelledAt = new Date();
          }
          await order.save({ session });

          // Release stock reservation
          const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
          const listing = await Listing.findById(order.listing).session(session);
          if (listing) {
            listing.inventory.quantity += totalQuantity;
            listing.inventory.reserved -= totalQuantity;
            if (listing.status === 'sold_out' && listing.inventory.quantity > 0) {
              listing.status = 'active';
            }
            await listing.save({ session });
          }

          orderToNotify = order;
          notificationStatus = 'FAILED';

          logger.info(
            { orderNumber: order.orderNumber, depositId },
            'Order cancelled due to failed payment callback.'
          );
        }
      });
    } finally {
      session.endSession();
    }

    // Trigger notifications and Socket.io broadcasts to vendor and customer AFTER transaction commits
    if (orderToNotify) {
      setImmediate(() => {
        if (notificationStatus === 'COMPLETED') {
          sendNewOrderNotifications(orderToNotify._id).catch((err) =>
            logger.error({ err }, 'Failed to send paid order notifications')
          );
        }

        try {
          const io = socketManager.getIO();
          io.to(`user_${orderToNotify.customer.toString()}`).emit(
            'order_status_updated',
            orderToNotify
          );
        } catch (socketErr) {
          logger.error({ err: socketErr }, 'Socket emit in webhook failed');
        }
      });
    }

    // Always respond HTTP 200 to acknowledge webhook
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    logger.error({ err: error.message }, 'pawaPay webhook processing error');
    // Return 200 OK anyway to prevent pawaPay from hammering the webhook on crash
    return res.status(200).json({ error: 'processing error' });
  }
};

/**
 * @desc    Get payment status for a specific order (polling fallback)
 * @route   GET /api/payments/status/:orderId
 * @access  Private
 */
const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({ message: 'No payment record found for this order' });
    }

    // Authorize check
    const order = await Order.findById(payment.order);
    if (
      order &&
      order.customer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    return res.status(200).json({
      status: payment.status,
      depositId: payment.depositId,
      providerTransactionId: payment.providerTransactionId,
      failureReason: payment.failureReason,
    });
  } catch (error) {
    logger.error({ err: error.message }, 'Get payment status failed');
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initiatePayment,
  handleWebhook,
  getPaymentStatus,
};

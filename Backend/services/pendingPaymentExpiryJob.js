const mongoose = require('mongoose');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

const PENDING_PAYMENT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const JOB_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes

let jobTimer = null;

/**
 * Cancel all orders stuck in pending_payment for more than 30 minutes
 * and atomically release their reserved listing inventory.
 */
async function expirePendingPayments() {
  const cutoff = new Date(Date.now() - PENDING_PAYMENT_TIMEOUT_MS);

  // Find stale pending_payment orders
  const staleOrders = await Order.find({
    status: 'pending_payment',
    createdAt: { $lt: cutoff },
  }).lean();

  if (staleOrders.length === 0) return;

  logger.info({ count: staleOrders.length }, 'pendingPaymentExpiryJob: cancelling stale orders');

  for (const order of staleOrders) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Mark order as cancelled
        await Order.findByIdAndUpdate(
          order._id,
          {
            status: 'cancelled',
            'payment.paymentStatus': 'failed',
            'statusTimestamps.cancelledAt': new Date(),
          },
          { session }
        );

        // Mark any linked pending payment as failed
        await Payment.findOneAndUpdate(
          { order: order._id, status: 'pending' },
          {
            status: 'failed',
            'failureReason.code': 'TIMEOUT',
            'failureReason.description': 'Payment was not completed within 30 minutes.',
          },
          { session }
        );

        // Release reserved listing inventory
        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const listing = await Listing.findById(order.listing).session(session);
        if (listing) {
          listing.inventory.quantity += totalQuantity;
          listing.inventory.reserved = Math.max(0, listing.inventory.reserved - totalQuantity);
          // Re-activate if it was marked sold_out
          if (listing.status === 'sold_out' && listing.inventory.quantity > 0) {
            listing.status = 'active';
          }
          await listing.save({ session });
        }
      });

      logger.info(
        { orderNumber: order.orderNumber },
        'pendingPaymentExpiryJob: stale order cancelled and stock released'
      );
    } catch (err) {
      logger.error(
        { err: err.message, orderId: order._id },
        'pendingPaymentExpiryJob: failed to cancel stale order'
      );
    } finally {
      session.endSession();
    }
  }
}

/**
 * Start the recurring pending payment expiry job
 */
function startPendingPaymentExpiryJob() {
  logger.info('Pending payment expiry job started — runs every 5 min');

  // Run immediately on startup, then every 5 minutes
  expirePendingPayments().catch((err) =>
    logger.error({ err: err.message }, 'pendingPaymentExpiryJob: initial run failed')
  );

  jobTimer = setInterval(() => {
    expirePendingPayments().catch((err) =>
      logger.error({ err: err.message }, 'pendingPaymentExpiryJob: scheduled run failed')
    );
  }, JOB_INTERVAL_MS);
}

/**
 * Stop the recurring job (used during graceful shutdown)
 */
function stopPendingPaymentExpiryJob() {
  if (jobTimer) {
    clearInterval(jobTimer);
    jobTimer = null;
    logger.info('Pending payment expiry job stopped');
  }
}

module.exports = { startPendingPaymentExpiryJob, stopPendingPaymentExpiryJob };

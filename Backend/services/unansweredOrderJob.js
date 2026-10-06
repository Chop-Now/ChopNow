const Order = require('../models/Order');
const Business = require('../models/Business');
const User = require('../models/User');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const {
  sendVendorOrderReminderEmail,
  sendOrderCancelledEmail,
  sendVendorOrderCancelledEmail,
} = require('../utils/emailService');
const { cancelOrderAndRestoreInventory } = require('../controllers/orderController');

// A customer has paid and is waiting. Remind the vendor early; if nobody answers within a day, give
// the customer their money back instead of leaving it stuck (a paid order sat unanswered for 10 days).
const REMIND_AFTER_MS = 60 * 60 * 1000; // 1 hour
const CANCEL_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const JOB_INTERVAL_MS = 10 * 60 * 1000;
// Only orders from the last two weeks: anything older is left for a person to look at rather than
// being cancelled, refunded and emailed about out of the blue the moment this job first runs.
const IGNORE_OLDER_THAN_MS = 14 * 24 * 60 * 60 * 1000;

let jobTimer = null;

const fullName = (u) => `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || 'there';

async function remindVendor(order, business, owner) {
  // Claim the reminder first so two server instances (or two runs) never send it twice
  const claimed = await Order.updateOne(
    { _id: order._id, status: 'paid', vendorReminderSentAt: { $exists: false } },
    { $set: { vendorReminderSentAt: new Date() } }
  );
  if (!claimed.modifiedCount) return false;

  const hoursLeft = Math.max(1, Math.round(CANCEL_AFTER_MS / 3600000 - REMIND_AFTER_MS / 3600000));
  await Notification.createNotification({
    user: owner._id,
    title: 'A paid order is waiting for you',
    message: `Order #${order.orderNumber} has been paid and is waiting. Accept it, or cancel it if you cannot fulfil it. It is cancelled and refunded automatically after 24 hours without a reply.`,
    type: 'order_reminder',
    relatedOrder: order._id,
    relatedBusiness: business._id,
    link: '/dashboard',
  });
  if (owner.preferences?.notifications?.email !== false) {
    sendVendorOrderReminderEmail(owner.email, business.name, order, hoursLeft).catch((err) =>
      logger.error({ err }, 'unansweredOrderJob: reminder email failed')
    );
  }
  return true;
}

async function cancelUnanswered(order, business, owner) {
  const reason = 'Cancelled automatically: the vendor did not respond within 24 hours';
  const cancelled = await cancelOrderAndRestoreInventory(order, {
    fromStatuses: ['paid'],
    reason,
  });
  if (!cancelled) return false;

  const customer = await User.findById(order.customer);
  const refunded = order.payment?.paymentMethod === 'mobile_money';
  await Notification.createNotification({
    user: order.customer,
    title: 'Order cancelled',
    message: `Order #${order.orderNumber} was cancelled because ${business.name} did not respond in time.${refunded ? ' Your payment will be refunded.' : ''}`,
    type: 'order_cancelled',
    relatedOrder: order._id,
    relatedBusiness: business._id,
    link: '/my-orders',
  });
  await Notification.createNotification({
    user: owner._id,
    title: 'Order cancelled automatically',
    message: `Order #${order.orderNumber} was cancelled and refunded because it was not accepted within 24 hours.`,
    type: 'order_cancelled',
    relatedOrder: order._id,
    relatedBusiness: business._id,
    link: '/dashboard',
  });
  if (customer && customer.preferences?.notifications?.email !== false) {
    sendOrderCancelledEmail(customer.email, fullName(customer), order, reason).catch((err) =>
      logger.error({ err }, 'unansweredOrderJob: customer cancel email failed')
    );
  }
  if (owner.preferences?.notifications?.email !== false) {
    sendVendorOrderCancelledEmail(owner.email, business.name, order, fullName(customer)).catch(
      (err) => logger.error({ err }, 'unansweredOrderJob: vendor cancel email failed')
    );
  }
  return true;
}

/**
 * One pass: remind vendors about paid orders waiting over an hour, cancel (and queue the refund
 * for) those waiting over a day. Returns what it did, for the logs and the tests.
 */
async function handleUnansweredOrders(now = Date.now()) {
  const candidates = await Order.find({
    status: 'paid',
    createdAt: { $lt: new Date(now - REMIND_AFTER_MS), $gt: new Date(now - IGNORE_OLDER_THAN_MS) },
  });
  const result = { reminded: 0, cancelled: 0 };

  for (const order of candidates) {
    try {
      const waitingSince = order.statusTimestamps?.paidAt || order.createdAt;
      const age = now - new Date(waitingSince).getTime();
      if (age < REMIND_AFTER_MS) continue;

      const business = await Business.findById(order.business).select('name owner');
      const owner = business?.owner ? await User.findById(business.owner) : null;
      if (!business || !owner) continue;

      if (age >= CANCEL_AFTER_MS) {
        if (await cancelUnanswered(order, business, owner)) result.cancelled += 1;
      } else if (!order.vendorReminderSentAt) {
        if (await remindVendor(order, business, owner)) result.reminded += 1;
      }
    } catch (err) {
      logger.error({ err: err.message, orderId: order._id }, 'unansweredOrderJob: order failed');
    }
  }
  if (result.reminded || result.cancelled) logger.info(result, 'unansweredOrderJob: done');
  return result;
}

function startUnansweredOrderJob() {
  logger.info('Unanswered order job started - runs every 10 min');
  const run = () =>
    handleUnansweredOrders().catch((err) =>
      logger.error({ err: err.message }, 'unansweredOrderJob: run failed')
    );
  run();
  jobTimer = setInterval(run, JOB_INTERVAL_MS);
}

function stopUnansweredOrderJob() {
  if (jobTimer) {
    clearInterval(jobTimer);
    jobTimer = null;
  }
}

module.exports = {
  startUnansweredOrderJob,
  stopUnansweredOrderJob,
  handleUnansweredOrders,
  REMIND_AFTER_MS,
  CANCEL_AFTER_MS,
};

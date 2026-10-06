/**
 * A customer pays; the vendor never answers. After an hour the vendor is reminded, after a day the
 * order is cancelled and the customer refunded (a real paid order sat unanswered for 10 days).
 */
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./app');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const RefundRequest = require('../models/RefundRequest');
const emailService = require('../utils/emailService');
const { handleUnansweredOrders } = require('../services/unansweredOrderJob');
const { createConsumer, createBusinessOwnerWithBusiness, createListing } = require('./fixtures');

const HOUR = 3600 * 1000;

async function paidOrder(paidHoursAgo, extra = {}) {
  const vendor = await createBusinessOwnerWithBusiness();
  const listing = await createListing(vendor.business, { inventory: { quantity: 5 } });
  const customer = await createConsumer();
  const res = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${customer.token}`)
    .send({
      listing: listing._id.toString(),
      items: [{ listing: listing._id.toString(), quantity: 2 }],
      fulfillmentType: 'pickup',
      payment: { paymentMethod: 'mobile_money' },
    });
  const order = res.body;
  await Payment.create({
    order: order._id,
    depositId: `dep-${order._id}`,
    amount: order.pricing.total,
    payerPhoneNumber: '+250700000000',
    correspondent: 'MTN_MOMO_RWA',
    status: 'completed',
  });
  const paidAt = new Date(Date.now() - paidHoursAgo * HOUR);
  await Order.findByIdAndUpdate(order._id, {
    status: 'paid',
    'payment.paymentStatus': 'completed',
    'statusTimestamps.paidAt': paidAt,
    ...extra,
  });
  // createdAt is immutable through Mongoose; an old order is made by writing it directly
  await Order.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(order._id) },
    { $set: { createdAt: paidAt } }
  );
  return { order, listing, vendor, customer };
}

describe('unanswered paid orders', () => {
  beforeEach(() => {
    emailService.sendVendorOrderReminderEmail.mockClear();
    emailService.sendOrderCancelledEmail.mockClear();
  });

  it('does nothing to an order that was paid minutes ago', async () => {
    const { order } = await paidOrder(0.2);
    expect(await handleUnansweredOrders()).toEqual({ reminded: 0, cancelled: 0 });
    expect((await Order.findById(order._id)).status).toBe('paid');
  });

  it('reminds the vendor once after an hour (notification + email)', async () => {
    const { order, vendor } = await paidOrder(2);
    expect((await handleUnansweredOrders()).reminded).toBe(1);

    const note = await Notification.findOne({ user: vendor.user._id, type: 'order_reminder' });
    expect(note.message).toContain(order.orderNumber);
    expect(emailService.sendVendorOrderReminderEmail).toHaveBeenCalledTimes(1);
    expect((await Order.findById(order._id)).status).toBe('paid');

    // a second pass must not nag again
    expect((await handleUnansweredOrders()).reminded).toBe(0);
    expect(emailService.sendVendorOrderReminderEmail).toHaveBeenCalledTimes(1);
  });

  it('cancels after a day, queues the refund, returns the stock and tells both sides', async () => {
    const { order, listing, vendor, customer } = await paidOrder(25);
    expect((await handleUnansweredOrders()).cancelled).toBe(1);

    expect((await Order.findById(order._id)).status).toBe('cancelled');
    expect((await Listing.findById(listing._id)).inventory.quantity).toBe(5);
    const refund = await RefundRequest.findOne({ order: order._id });
    expect(refund.amount).toBe(order.pricing.total);
    expect(refund.reason).toMatch(/did not respond/);

    const toCustomer = await Notification.findOne({
      user: customer.user._id,
      type: 'order_cancelled',
    });
    expect(toCustomer.message).toMatch(/refunded/);
    expect(
      await Notification.findOne({ user: vendor.user._id, type: 'order_cancelled' })
    ).toBeTruthy();
    expect(emailService.sendOrderCancelledEmail).toHaveBeenCalledTimes(1);
  });

  it('leaves an order the vendor already accepted alone', async () => {
    const { order } = await paidOrder(30, { status: 'confirmed' });
    expect(await handleUnansweredOrders()).toEqual({ reminded: 0, cancelled: 0 });
    expect((await Order.findById(order._id)).status).toBe('confirmed');
  });

  it('ignores very old orders instead of cancelling them out of the blue', async () => {
    const { order } = await paidOrder(24 * 40);
    expect(await handleUnansweredOrders()).toEqual({ reminded: 0, cancelled: 0 });
    expect((await Order.findById(order._id)).status).toBe('paid');
  });
});

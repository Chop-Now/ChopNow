/**
 * A vendor who cannot fulfil an order (sold out, closing early) must be able to
 * call it off themselves: the customer is refunded, told why, and the stock
 * goes back. Customers keep their narrower window; strangers get nothing.
 */
const request = require('supertest');
const app = require('./app');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const RefundRequest = require('../models/RefundRequest');
const {
  createConsumer,
  createBusinessOwnerWithBusiness,
  createListing,
  eventually,
} = require('./fixtures');

async function paidOrder(status = 'paid') {
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
  await Order.findByIdAndUpdate(order._id, { status, 'payment.paymentStatus': 'completed' });
  return { order, listing, vendor, customer };
}

const cancel = (token, order, body) =>
  request(app)
    .put(`/api/v1/orders/${order._id}/cancel`)
    .set('Authorization', `Bearer ${token}`)
    .send(body);

describe('vendor cancelling an order', () => {
  it('refunds the customer, restores stock and tells them why', async () => {
    const { order, listing, vendor, customer } = await paidOrder();

    const res = await cancel(vendor.token, order, { reason: 'Sold out of croissants.' });
    expect(res.status).toBe(200);

    expect((await Order.findById(order._id)).status).toBe('cancelled');
    expect((await Listing.findById(listing._id)).inventory.quantity).toBe(5);
    const refund = await RefundRequest.findOne({ order: order._id });
    expect(refund.amount).toBe(order.pricing.total);
    expect(refund.reason).toMatch(/vendor: Sold out of croissants/);

    const note = await eventually(() =>
      Notification.findOne({ user: customer.user._id, type: 'order_cancelled' })
    );
    expect(note.message).toMatch(/Sold out of croissants. Your payment/);
    expect(note.message).toMatch(/refunded/);
  });

  it('can still cancel while the order is being prepared or is ready, which a customer cannot', async () => {
    const preparing = await paidOrder('preparing');
    expect((await cancel(preparing.customer.token, preparing.order, {})).status).toBe(400);
    expect((await cancel(preparing.vendor.token, preparing.order, {})).status).toBe(200);

    const ready = await paidOrder('ready_for_pickup');
    expect((await cancel(ready.vendor.token, ready.order, {})).status).toBe(200);
  });

  it('cannot cancel an order that is already out for delivery or completed', async () => {
    const onTheWay = await paidOrder('out_for_delivery');
    expect((await cancel(onTheWay.vendor.token, onTheWay.order, {})).status).toBe(400);
    const done = await paidOrder('completed');
    expect((await cancel(done.vendor.token, done.order, {})).status).toBe(400);
  });

  it("another vendor cannot cancel someone else's order", async () => {
    const { order } = await paidOrder();
    const stranger = await createBusinessOwnerWithBusiness();
    expect((await cancel(stranger.token, order, {})).status).toBe(403);
    expect((await Order.findById(order._id)).status).toBe('paid');
  });
});

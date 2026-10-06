/**
 * Finishing a pickup by entering the customer's code used to email the customer but leave no
 * in-app notice (only the status route did). Both ways now tell them.
 */
const request = require('supertest');
const app = require('./app');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const {
  createConsumer,
  createBusinessOwnerWithBusiness,
  createListing,
  eventually,
} = require('./fixtures');

async function readyOrder() {
  const vendor = await createBusinessOwnerWithBusiness();
  const listing = await createListing(vendor.business);
  const customer = await createConsumer();
  const res = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${customer.token}`)
    .send({
      listing: listing._id.toString(),
      items: [{ listing: listing._id.toString(), quantity: 1 }],
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
  await Order.findByIdAndUpdate(order._id, {
    status: 'ready_for_pickup',
    'payment.paymentStatus': 'completed',
  });
  return { order, vendor, customer };
}

describe('order completed notice', () => {
  it('is created when the vendor completes a pickup with the customer code', async () => {
    const { order, vendor, customer } = await readyOrder();
    const res = await request(app)
      .post(`/api/v1/orders/${order._id}/verify-pickup`)
      .set('Authorization', `Bearer ${vendor.token}`)
      .send({ pickupCode: order.pickupDetails.pickupCode });
    expect(res.status).toBe(200);

    const note = await eventually(() =>
      Notification.findOne({ user: customer.user._id, type: 'order_completed' })
    );
    expect(note).toBeTruthy();
    expect(note.message).toContain(order.orderNumber);
    expect(note.link).toBe('/my-orders');
  });

  it('is not created when the code is wrong', async () => {
    const { order, vendor, customer } = await readyOrder();
    const res = await request(app)
      .post(`/api/v1/orders/${order._id}/verify-pickup`)
      .set('Authorization', `Bearer ${vendor.token}`)
      .send({ pickupCode: 'WRONG1' });
    expect(res.status).toBe(400);
    expect(
      await Notification.findOne({ user: customer.user._id, type: 'order_completed' })
    ).toBeNull();
  });
});

/**
 * POST /api/v1/disputes - dispute creation regression tests.
 *
 * The only real caller of this endpoint is the mobile app's "Report an
 * Issue" screen (Mobile/lib/features/orders/dispute_screen.dart), which
 * sends { order, reason, description } - no `type`, no `title`. That body
 * used to 500: the controller read a nonexistent `orderId` field instead of
 * `order`, the request validator's `type` enum didn't match the Dispute
 * model's own `type` enum, and neither `title` nor `description` (both
 * required by the model) were validated. These tests hit the endpoint with
 * that exact real-world payload shape.
 */
const request = require('supertest');
const app = require('./app');
const {
  createConsumer,
  createBusinessOwnerWithBusiness,
  createListing,
  eventually,
} = require('./fixtures');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

async function createOrderForDispute({ paid = true } = {}) {
  const { business, user: owner } = await createBusinessOwnerWithBusiness();
  const listing = await createListing(business, { pricing: { price: 3000, currency: 'RWF' } });
  const { token: consumerToken, user: consumer } = await createConsumer();

  const orderRes = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${consumerToken}`)
    .send({
      listing: listing._id.toString(),
      items: [{ listing: listing._id.toString(), quantity: 1 }],
      fulfillmentType: 'pickup',
      payment: { paymentMethod: 'mobile_money' },
    });

  // Only an order that was paid for can be reported (a new order starts unpaid).
  if (paid) await Order.findByIdAndUpdate(orderRes.body._id, { status: 'paid' });

  return { order: orderRes.body, consumerToken, consumer, business, owner };
}

describe('POST /api/v1/disputes - creation matches the real mobile payload', () => {
  it('creates a dispute from the exact body the mobile app sends (order, reason, description)', async () => {
    const { order, consumerToken } = await createOrderForDispute();

    const res = await request(app)
      .post('/api/v1/disputes')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        order: order._id,
        reason: 'Missing items',
        description: 'Two of the three items I ordered were missing from the bag.',
      });

    expect(res.status).toBe(201);
    expect(res.body.order).toBe(order._id);
    expect(res.body.type).toBe('missing_item');
    expect(res.body.title).toBe('Missing items');
    expect(res.body.description).toBe(
      'Two of the three items I ordered were missing from the bag.'
    );
  });

  it('falls back to type "other" for a reason with no explicit mapping', async () => {
    const { order, consumerToken } = await createOrderForDispute();

    const res = await request(app)
      .post('/api/v1/disputes')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        order: order._id,
        reason: 'Wrong item received',
        description: 'I received a completely different meal than what I ordered.',
      });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('other');
  });

  it('rejects a request missing the required description with a 400, not a 500', async () => {
    const { order, consumerToken } = await createOrderForDispute();

    const res = await request(app)
      .post('/api/v1/disputes')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        order: order._id,
        reason: 'Missing items',
      });

    expect(res.status).toBe(400);
  });

  it('rejects a dispute for an order the requesting user does not own', async () => {
    const { order } = await createOrderForDispute();
    const { token: otherConsumerToken } = await createConsumer();

    const res = await request(app)
      .post('/api/v1/disputes')
      .set('Authorization', `Bearer ${otherConsumerToken}`)
      .send({
        order: order._id,
        reason: 'Missing items',
        description: 'Trying to dispute an order that is not mine.',
      });

    expect(res.status).toBe(403);
  });

  const report = (token, order, extra = {}) =>
    request(app)
      .post('/api/v1/disputes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        order: order._id,
        reason: 'Missing items',
        description: 'Two of the items were missing from the bag.',
        ...extra,
      });

  it('accepts the short "Other" reason the apps offer', async () => {
    const { order, consumerToken } = await createOrderForDispute();
    const res = await report(consumerToken, order, { reason: 'Other' });
    expect(res.status).toBe(201);
  });

  it('refuses a second report while the first is still open', async () => {
    const { order, consumerToken } = await createOrderForDispute();
    expect((await report(consumerToken, order)).status).toBe(201);
    const again = await report(consumerToken, order);
    expect(again.status).toBe(409);
    expect(again.body.message).toMatch(/already reported/i);
  });

  it('refuses a report on an order that was never paid', async () => {
    const { order, consumerToken } = await createOrderForDispute({ paid: false });
    expect((await report(consumerToken, order)).status).toBe(400);
  });

  it('tells the vendor a problem was reported', async () => {
    const { order, consumerToken, owner } = await createOrderForDispute();
    await report(consumerToken, order);
    const note = await eventually(() =>
      Notification.findOne({ user: owner._id, type: 'dispute_opened' })
    );
    expect(note).toBeTruthy();
    expect(note.message).toContain(order.orderNumber);
  });
});

/**
 * Estimated environmental impact, end to end.
 *
 * When an order completes its impact is worked out ONCE and stored on the order
 * (per item and in total), then added to the vendor's and the customer's totals.
 * Refunds for a customer problem take the same share back (and give it back if
 * the refund fails); refunds that are not about the food do not. Orders from
 * before this existed are filled in by an idempotent backfill. The cart's
 * preview and the analytics screens read the same numbers.
 */
const request = require('supertest');
const app = require('./app');
const Business = require('../models/Business');
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const RefundRequest = require('../models/RefundRequest');
const User = require('../models/User');
const { CATEGORY_FACTORS } = require('../config/impactFactors');
const {
  backfillOrderImpact,
  ensureImpactBackfilled,
  syncOrderImpactWithRefunds,
} = require('../services/impactService');
const {
  createAdmin,
  createConsumer,
  createBusinessOwnerWithBusiness,
  createListing,
  placePaidOrder,
} = require('./fixtures');

const MEALS = CATEGORY_FACTORS.meals;

const complete = (vendorToken, order) =>
  request(app)
    .put(`/api/v1/orders/${order._id}/status`)
    .set('Authorization', `Bearer ${vendorToken}`)
    .send({ status: 'completed' });

/** A paid, completed order of `quantity` x a 'meals' listing. */
async function completedOrder({ quantity = 2, listingOverrides = {} } = {}) {
  const { token: vendorToken, business } = await createBusinessOwnerWithBusiness();
  const listing = await createListing(business, {
    pricing: { price: 4000, currency: 'RWF' },
    ...listingOverrides,
  });
  const { token: consumerToken, user: consumer } = await createConsumer();
  const { order } = await placePaidOrder(consumerToken, listing, { quantity });
  const res = await complete(vendorToken, order);
  expect(res.status).toBe(200);
  return { vendorToken, business, listing, consumerToken, consumer, order };
}

async function refundVia(adminToken, order, consumer, business, { amount, full = true } = {}) {
  const dispute = await Dispute.create({
    order: order._id,
    customer: consumer._id,
    business: business._id,
    type: 'poor_quality',
    title: 'Food was cold',
    description: 'The order arrived cold and inedible on arrival at pickup time.',
  });
  const res = await request(app)
    .patch(`/api/v1/disputes/${dispute._id}/resolve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send(full ? { action: 'full_refund' } : { action: 'partial_refund', amount });
  expect(res.status).toBe(200);
  return RefundRequest.findOne({ dispute: dispute._id });
}

const settleRefund = (adminToken, refund, status) =>
  request(app)
    .patch(`/api/v1/disputes/refund-requests/${refund._id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status });

describe('impact is recorded when an order completes', () => {
  it('stores per-item and total impact on the order, and adds it to vendor and customer totals', async () => {
    const { business, consumer, order } = await completedOrder({ quantity: 2 });

    const stored = await Order.findById(order._id);
    const kg = 2 * MEALS.defaultWeightKg;
    expect(stored.impact.meals).toBe(2);
    expect(stored.impact.kg).toBeCloseTo(kg, 4);
    expect(stored.impact.co2e).toBeCloseTo(kg * MEALS.co2ePerKg, 3);
    expect(stored.impact.water).toBeCloseTo(kg * MEALS.waterPerKg, 1);
    expect(stored.impact.reversedFraction).toBe(0);
    expect(stored.impact.countedAt).toBeInstanceOf(Date);
    expect(stored.impact.version).toBeTruthy();
    expect(stored.items[0].impact.category).toBe('meals');
    expect(stored.items[0].impact.basis).toBe('default');
    expect(stored.items[0].impact.kg).toBeCloseTo(kg, 4);

    const biz = await Business.findById(business._id);
    expect(biz.stats.impact.mealsRescued).toBe(2);
    expect(biz.stats.impact.kgSaved).toBeCloseTo(kg, 3);
    expect(biz.stats.impact.co2Saved).toBeCloseTo(kg * MEALS.co2ePerKg, 3);
    expect(biz.stats.impact.waterSaved).toBeCloseTo(kg * MEALS.waterPerKg, 1);
    expect(biz.metrics.mealsSaved).toBe(2);

    const user = await User.findById(consumer._id);
    expect(user.stats.impact.meals).toBe(2);
    expect(user.stats.impact.co2Saved).toBeCloseTo(kg * MEALS.co2ePerKg, 3);
  });

  it('uses the weight in the title when there is one, and the category factor for the food', async () => {
    const { order } = await completedOrder({
      quantity: 3,
      listingOverrides: { title: 'Fresh Avocados 1kg', category: 'fruit-veg' },
    });
    const stored = await Order.findById(order._id);
    expect(stored.items[0].impact.basis).toBe('title');
    expect(stored.impact.kg).toBe(3);
    expect(stored.impact.co2e).toBeCloseTo(3 * CATEGORY_FACTORS['fruit-veg'].co2ePerKg, 3);
  });

  it('uses the listing unit when the vendor sells by weight', async () => {
    const { order } = await completedOrder({
      quantity: 4,
      listingOverrides: {
        category: 'fruit-veg',
        inventory: { quantity: 20, unit: 'kg' },
        title: 'Tomatoes',
      },
    });
    const stored = await Order.findById(order._id);
    expect(stored.items[0].impact.basis).toBe('unit');
    expect(stored.impact.kg).toBe(4);
  });

  it('counts an order only once, however often completion is attempted', async () => {
    const { vendorToken, business, consumer, order } = await completedOrder({ quantity: 1 });
    expect((await complete(vendorToken, order)).status).toBe(400);
    const { recordOrderImpact } = require('../services/impactService');
    expect(await recordOrderImpact(await Order.findById(order._id))).toBeNull();

    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBe(1);
    expect((await User.findById(consumer._id)).stats.impact.meals).toBe(1);
  });

  it('keeps the numbers an order was completed with when the factor table later changes', async () => {
    const { order } = await completedOrder({ quantity: 1 });
    const before = (await Order.findById(order._id)).impact.co2e;
    const factors = require('../config/impactFactors');
    const original = factors.CATEGORY_FACTORS.meals.co2ePerKg;
    factors.CATEGORY_FACTORS.meals.co2ePerKg = original * 10;
    try {
      expect((await Order.findById(order._id)).impact.co2e).toBe(before);
    } finally {
      factors.CATEGORY_FACTORS.meals.co2ePerKg = original;
    }
  });
});

describe('refunds for a customer problem take impact back', () => {
  it('removes all of it on a full refund and restores it if the refund fails', async () => {
    const { business, consumer, order } = await completedOrder({ quantity: 2 });
    const { token: adminToken } = await createAdmin();
    const refund = await refundVia(adminToken, order, consumer, business);

    let stored = await Order.findById(order._id);
    expect(stored.impact.reversedFraction).toBe(1);
    expect(stored.impact.meals).toBe(2); // gross is kept; only the counted share changes
    let biz = await Business.findById(business._id);
    expect(biz.stats.impact.mealsRescued).toBeCloseTo(0, 6);
    expect(biz.stats.impact.co2Saved).toBeCloseTo(0, 6);
    expect((await User.findById(consumer._id)).stats.impact.meals).toBeCloseTo(0, 6);

    expect((await settleRefund(adminToken, refund, 'failed')).status).toBe(200);

    stored = await Order.findById(order._id);
    expect(stored.impact.reversedFraction).toBe(0);
    biz = await Business.findById(business._id);
    expect(biz.stats.impact.mealsRescued).toBeCloseTo(2, 6);
    expect(biz.stats.impact.co2Saved).toBeCloseTo(2 * MEALS.defaultWeightKg * MEALS.co2ePerKg, 3);
    expect((await User.findById(consumer._id)).stats.impact.meals).toBeCloseTo(2, 6);
  });

  it('removes only the refunded share on a partial refund', async () => {
    const { business, consumer, order } = await completedOrder({ quantity: 2 });
    const total = (await Order.findById(order._id)).pricing.total;
    const { token: adminToken } = await createAdmin();
    await refundVia(adminToken, order, consumer, business, { amount: total / 4, full: false });

    const stored = await Order.findById(order._id);
    expect(stored.impact.reversedFraction).toBeCloseTo(0.25, 4);
    const biz = await Business.findById(business._id);
    expect(biz.stats.impact.mealsRescued).toBeCloseTo(1.5, 3);
    expect(biz.stats.impact.co2Saved).toBeCloseTo(
      0.75 * 2 * MEALS.defaultWeightKg * MEALS.co2ePerKg,
      3
    );
  });

  it('keeps the refund in effect once it is paid', async () => {
    const { business, consumer, order } = await completedOrder({ quantity: 1 });
    const { token: adminToken } = await createAdmin();
    const refund = await refundVia(adminToken, order, consumer, business);
    expect((await settleRefund(adminToken, refund, 'completed')).status).toBe(200);
    expect((await Order.findById(order._id)).impact.reversedFraction).toBe(1);
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBeCloseTo(0, 6);
  });

  it('is safe to sync repeatedly', async () => {
    const { business, consumer, order } = await completedOrder({ quantity: 2 });
    const { token: adminToken } = await createAdmin();
    await refundVia(adminToken, order, consumer, business);
    await syncOrderImpactWithRefunds(order._id);
    await syncOrderImpactWithRefunds(order._id);
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBeCloseTo(0, 6);
  });

  it('ignores refunds that are not about the food (no dispute attached)', async () => {
    const { business, consumer, order } = await completedOrder({ quantity: 2 });
    await RefundRequest.create({
      order: order._id,
      business: business._id,
      customer: consumer._id,
      amount: (await Order.findById(order._id)).pricing.total,
      requestedBy: consumer._id,
      reason: 'Paid twice',
    });
    await syncOrderImpactWithRefunds(order._id);

    expect((await Order.findById(order._id)).impact.reversedFraction).toBe(0);
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBe(2);
  });

  it('nets a refund that was already queued before the order completed', async () => {
    const { token: vendorToken, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business, { pricing: { price: 4000, currency: 'RWF' } });
    const { token: consumerToken, user: consumer } = await createConsumer();
    const { order } = await placePaidOrder(consumerToken, listing, { quantity: 1 });
    const dispute = await Dispute.create({
      order: order._id,
      customer: consumer._id,
      business: business._id,
      type: 'poor_quality',
      title: 'Food was cold',
      description: 'The order arrived cold and inedible on arrival at pickup time.',
    });
    await RefundRequest.create({
      order: order._id,
      dispute: dispute._id,
      business: business._id,
      customer: consumer._id,
      amount: (await Order.findById(order._id)).pricing.total,
      requestedBy: consumer._id,
    });

    expect((await complete(vendorToken, order)).status).toBe(200);
    expect((await Order.findById(order._id)).impact.reversedFraction).toBe(1);
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBeCloseTo(0, 6);
  });
});

describe('backfill of orders completed before impact existed', () => {
  async function legacyCompletedOrder(business, customer, listing, quantity) {
    return Order.create({
      customer: customer._id,
      business: business._id,
      listing: listing._id,
      status: 'completed',
      statusTimestamps: { completedAt: new Date('2026-01-15T10:00:00Z') },
      items: [
        {
          listing: listing._id,
          title: listing.title,
          quantity,
          unitPrice: 4000,
          subtotal: 4000 * quantity,
        },
      ],
      pricing: { subtotal: 4000 * quantity, total: 4000 * quantity, currency: 'RWF' },
      fulfillmentType: 'pickup',
      payment: { paymentMethod: 'cash', paymentStatus: 'pending' },
    });
  }

  it('fills in impact, replaces the old flat-rate totals, and does nothing the second time', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { user: customer } = await createConsumer();
    await legacyCompletedOrder(business, customer, listing, 2);
    await legacyCompletedOrder(business, customer, listing, 1);
    // What the old flat-rate code would have left behind.
    await Business.updateOne(
      { _id: business._id },
      { $set: { 'stats.impact.mealsRescued': 3, 'stats.impact.co2Saved': 7.5 } }
    );

    const first = await backfillOrderImpact();
    expect(first).toEqual({ orders: 2, businesses: 1, customers: 1 });

    const biz = await Business.findById(business._id);
    const kg = 3 * MEALS.defaultWeightKg;
    expect(biz.stats.impact.mealsRescued).toBe(3);
    expect(biz.stats.impact.co2Saved).toBeCloseTo(kg * MEALS.co2ePerKg, 3); // 4.05, not 7.5
    expect((await User.findById(customer._id)).stats.impact.meals).toBe(3);

    const orders = await Order.find({ business: business._id });
    orders.forEach((o) => {
      expect(o.impact.countedAt.toISOString()).toBe('2026-01-15T10:00:00.000Z');
      expect(o.items[0].impact.category).toBe('meals');
    });

    expect(await backfillOrderImpact()).toEqual({ orders: 0, businesses: 0, customers: 0 });
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBe(3);
  });

  it('zeroes a vendor whose only orders no longer count', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const { business: other } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(other);
    const { user: customer } = await createConsumer();
    await Business.updateOne(
      { _id: business._id },
      { $set: { 'stats.impact.mealsRescued': 40, 'stats.impact.co2Saved': 100 } }
    );
    await legacyCompletedOrder(other, customer, listing, 1);

    await backfillOrderImpact();
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBe(0);
    expect((await Business.findById(business._id)).stats.impact.co2Saved).toBe(0);
  });

  it('runs safely at startup, and is a no-op when nothing is missing', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { user: customer } = await createConsumer();
    await legacyCompletedOrder(business, customer, listing, 1);

    await ensureImpactBackfilled();
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBe(1);
    await ensureImpactBackfilled();
    expect((await Business.findById(business._id)).stats.impact.mealsRescued).toBe(1);
  });
});

describe('POST /api/v1/orders/quote - cart preview', () => {
  it('returns the same estimate the order will be stamped with', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business, {
      title: 'Bananas 1kg',
      category: 'fruit-veg',
      pricing: { price: 1000, currency: 'RWF' },
    });
    const { token } = await createConsumer();

    const res = await request(app)
      .post('/api/v1/orders/quote')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ listing: String(listing._id), quantity: 3 }], fulfillmentType: 'pickup' });
    expect(res.status).toBe(200);
    expect(res.body.impact.meals).toBe(3);
    expect(res.body.impact.kg).toBe(3);
    expect(res.body.impact.co2e).toBeCloseTo(3 * CATEGORY_FACTORS['fruit-veg'].co2ePerKg, 3);
    expect(res.body.impact.water).toBeCloseTo(3 * CATEGORY_FACTORS['fruit-veg'].waterPerKg, 1);
  });
});

describe('analytics read the stored impact', () => {
  it('GET /analytics/impact/methodology is public and lists every category', async () => {
    const res = await request(app).get('/api/v1/analytics/impact/methodology');
    expect(res.status).toBe(200);
    expect(res.body.categories.map((c) => c.key).sort()).toEqual(
      Object.keys(CATEGORY_FACTORS).sort()
    );
    expect(res.body.sources.length).toBeGreaterThan(0);
  });

  it('GET /analytics/impact/my sums a customer’s orders, flagged as estimates, net of refunds', async () => {
    const { business, consumer, consumerToken, order } = await completedOrder({ quantity: 2 });
    const kg = 2 * MEALS.defaultWeightKg;

    let res = await request(app)
      .get('/api/v1/analytics/impact/my')
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.estimated).toBe(true);
    expect(res.body.mealsRescued).toBe(2);
    expect(res.body.foodWasteSaved).toBeCloseTo(kg, 1);
    expect(res.body.co2Saved).toBeCloseTo(kg * MEALS.co2ePerKg, 1);
    expect(res.body.waterSaved).toBe(Math.round(kg * MEALS.waterPerKg));
    expect(res.body.ordersCount).toBe(1);
    expect(res.body.comparison.thisMonth.meals).toBe(2);
    expect(res.body.comparison.lastMonth.meals).toBe(0);
    const thisMonth = res.body.monthlyData[res.body.monthlyData.length - 1];
    expect(thisMonth.meals).toBe(2);
    expect(thisMonth.co2).toBeCloseTo(kg * MEALS.co2ePerKg, 1);

    const { token: adminToken } = await createAdmin();
    await refundVia(adminToken, order, consumer, business);

    res = await request(app)
      .get('/api/v1/analytics/impact/my')
      .set('Authorization', `Bearer ${consumerToken}`);
    expect(res.body.mealsRescued).toBe(0);
    expect(res.body.co2Saved).toBe(0);
  });

  it('GET /analytics/impact/my for a vendor reads orders and no longer writes to the business', async () => {
    const { vendorToken, business } = await completedOrder({ quantity: 1 });
    await Business.updateOne({ _id: business._id }, { $set: { 'stats.impact.co2Saved': 999 } });

    const res = await request(app)
      .get('/api/v1/analytics/impact/my')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.mealsRescued).toBe(1);
    expect(res.body.co2Saved).toBeCloseTo(MEALS.defaultWeightKg * MEALS.co2ePerKg, 1);
    // A GET must not overwrite stored totals.
    expect((await Business.findById(business._id)).stats.impact.co2Saved).toBe(999);
  });

  it('the platform and business overviews agree with the orders', async () => {
    const { vendorToken, business } = await completedOrder({ quantity: 2 });
    const kg = 2 * MEALS.defaultWeightKg;
    const { token: adminToken } = await createAdmin();

    const platform = await request(app)
      .get('/api/v1/analytics/platform/overview')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(platform.status).toBe(200);
    expect(platform.body.impact.estimated).toBe(true);
    expect(platform.body.impact.totalMealsRescued).toBe(2);
    expect(platform.body.impact.totalFoodWasteSaved).toBeCloseTo(kg, 1);
    expect(platform.body.impact.totalCo2Saved).toBeCloseTo(kg * MEALS.co2ePerKg, 1);
    expect(platform.body.weeklyImpact[3].meals).toBe(2);
    expect(platform.body.weeklyImpact[3].co2Saved).toBeCloseTo(kg * MEALS.co2ePerKg, 1);
    const month = platform.body.monthlyImpact[platform.body.monthlyImpact.length - 1];
    expect(month.meals).toBe(2);
    expect(platform.body.categoryImpact).toEqual([
      expect.objectContaining({ category: 'meals', meals: 2, percent: 100 }),
    ]);

    const vendor = await request(app)
      .get('/api/v1/analytics/business/overview')
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(vendor.status).toBe(200);
    expect(vendor.body.categoryImpact[0].co2).toBeCloseTo(kg * MEALS.co2ePerKg, 1);
    expect(vendor.body.stats.impact.mealsRescued).toBe(2);
    expect(business).toBeTruthy();
  });

  it('GET /analytics/admin/stats reports estimated CO2e from stored impact', async () => {
    await completedOrder({ quantity: 2 });
    const { token: adminToken } = await createAdmin();
    const res = await request(app)
      .get('/api/v1/analytics/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.impact.mealsRescued).toBe(2);
    expect(res.body.impact.co2Saved).toBeCloseTo(2 * MEALS.defaultWeightKg * MEALS.co2ePerKg, 1);
    expect(res.body.impact.estimated).toBe(true);
  });
});

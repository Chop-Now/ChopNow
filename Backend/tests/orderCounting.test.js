/**
 * "Total Orders" must mean orders someone actually had to serve. A mobile-money
 * checkout that was never paid (still pending, or cancelled/expired without the
 * money arriving) is not one, and a stored counter that only ever goes up must
 * not be what the dashboard shows.
 */
const request = require('supertest');
const app = require('./app');
const Order = require('../models/Order');
const Business = require('../models/Business');
const {
  createBusinessOwnerWithBusiness,
  createListing,
  createConsumer,
  createAdmin,
} = require('./fixtures');

async function seed() {
  const vendor = await createBusinessOwnerWithBusiness();
  const listing = await createListing(vendor.business);
  const { user: customer } = await createConsumer();
  const make = (status, paymentMethod, paymentStatus) =>
    Order.create({
      customer: customer._id,
      business: vendor.business._id,
      listing: listing._id,
      items: [{ listing: listing._id, title: 'x', quantity: 1, unitPrice: 1000, subtotal: 1000 }],
      pricing: { subtotal: 1000, deliveryFee: 0, platformFee: 100, vendorAmount: 900, total: 1000 },
      fulfillmentType: 'pickup',
      status,
      payment: { paymentMethod, paymentStatus },
    });

  await make('completed', 'mobile_money', 'completed');
  await make('confirmed', 'mobile_money', 'completed');
  await make('preparing', 'mobile_money', 'completed');
  await make('cancelled', 'mobile_money', 'refund_pending'); // paid, then called off: real
  await make('pending_payment', 'mobile_money', 'pending'); // abandoned checkout
  await make('cancelled', 'mobile_money', 'pending'); // expired unpaid
  await make('pending_payment', 'cash', 'pending'); // cash order waiting on the vendor: real
  return vendor;
}

describe('order counting ignores abandoned checkouts', () => {
  it('vendor dashboard and analytics agree, and do not use the stored counter', async () => {
    const vendor = await seed();
    await Business.updateOne({ _id: vendor.business._id }, { 'stats.totalOrders': 99 });

    const res = await request(app)
      .get('/api/v1/analytics/business/overview')
      .set('Authorization', `Bearer ${vendor.token}`);
    expect(res.status).toBe(200);
    expect(res.body.fulfillmentBreakdown.total).toBe(5);
    expect(res.body.stats.totalOrders).toBe(5);
  });

  it('admin totals skip them too, and in-progress includes orders being prepared', async () => {
    await seed();
    const admin = await createAdmin();
    const res = await request(app)
      .get('/api/v1/analytics/admin/stats')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(200);
    const total = res.body.orders.total;
    const pending = res.body.orders.pending;
    // 5 real orders in this test; other suites' data is cleared between tests
    expect(total).toBe(5);
    // confirmed + preparing + the cash order waiting on the vendor
    expect(pending).toBe(3);

    const overview = await request(app)
      .get('/api/v1/analytics/platform/overview')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(overview.body.overview.totalOrders).toBe(5);
  });

  it('the vendor order list hides abandoned checkouts, and Pending includes preparing', async () => {
    const vendor = await seed();
    const list = await request(app)
      .get('/api/v1/orders?limit=50')
      .set('Authorization', `Bearer ${vendor.token}`);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(5);
    const unpaid = list.body.orders.filter(
      (o) => o.payment.paymentMethod === 'mobile_money' && o.payment.paymentStatus === 'pending'
    );
    expect(unpaid).toHaveLength(0);

    const pending = await request(app)
      .get('/api/v1/orders?status=pending&limit=50')
      .set('Authorization', `Bearer ${vendor.token}`);
    expect(pending.body.orders.map((o) => o.status).sort()).toEqual([
      'confirmed',
      'pending_payment',
      'preparing',
    ]);
  });
});

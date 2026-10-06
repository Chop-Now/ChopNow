/**
 * The test-data purge must remove test data completely and never touch real data:
 * real customers/vendors, admins, and anything paid with real money.
 */
const request = require('supertest');
const app = require('./app');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Business = require('../models/Business');
const Notification = require('../models/Notification');
const { CONFIRMATION } = require('../services/testDataPurge');
const {
  createAdmin,
  createBusinessOwnerWithBusiness,
  createConsumer,
  createListing,
  placePaidOrder,
  placePendingMobileMoneyOrder,
} = require('./fixtures');

const rename = (user, email) => User.updateOne({ _id: user._id }, { $set: { email } });
const PURGE = '/api/v1/analytics/admin/data-purge';

async function seed() {
  // Real vendor, real customer.
  const vendor = await createBusinessOwnerWithBusiness();
  await rename(vendor.user, 'realvendor@gmail.com');
  const customer = await createConsumer();
  await rename(customer.user, 'realcustomer@gmail.com');
  const listing = await createListing(vendor.business, { pricing: { price: 3000 } });
  const real = await placePaidOrder(customer.token, listing);

  // A test vendor with a shop and an E2E listing, and a test customer who bought from the real shop
  // with a simulated payment.
  const testVendor = await createBusinessOwnerWithBusiness();
  await rename(testVendor.user, 'e2e_vendor@chopnow.app');
  const testListing = await createListing(testVendor.business, { title: 'E2E Meal zz1' });
  const tester = await createConsumer({ email: 'e2e_buyer@chopnow.app' });
  const fake = await placePendingMobileMoneyOrder(tester.token, listing);
  await Payment.updateOne(
    { depositId: fake.depositId },
    {
      $set: {
        status: 'completed',
        providerTransactionId: 'TEST-ABCD1234',
        rawCallbackData: { simulated: true },
      },
    }
  );
  await Order.updateOne({ _id: fake.order._id }, { $set: { status: 'completed' } });

  // A test-account order paid with REAL money: must survive, with its people and shop.
  const realMoneyTester = await createConsumer({ email: 'e2e_realmoney@chopnow.app' });
  const protectedOrder = await placePaidOrder(realMoneyTester.token, testListing);

  // A test-looking admin: must survive.
  const admin = await createAdmin();
  await rename(admin.user, 'e2e_admin@chopnow.app');

  return {
    vendor,
    customer,
    listing,
    real,
    testVendor,
    testListing,
    tester,
    fake,
    protectedOrder,
    realMoneyTester,
    admin,
  };
}

describe('test-data purge', () => {
  it('is admin only, and refuses without the typed confirmation', async () => {
    const { token: consumerToken } = await createConsumer();
    const { token: adminToken } = await createAdmin();
    expect((await request(app).get(PURGE)).status).toBe(401);
    expect(
      (await request(app).get(PURGE).set('Authorization', `Bearer ${consumerToken}`)).status
    ).toBe(403);
    expect(
      (await request(app).post(PURGE).set('Authorization', `Bearer ${consumerToken}`).send({}))
        .status
    ).toBe(403);
    const refused = await request(app)
      .post(PURGE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ confirmation: 'yes' });
    expect(refused.status).toBe(400);
    const none = await request(app)
      .post(PURGE)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(none.status).toBe(400);
  });

  it('preview reports the plan and changes nothing', async () => {
    const s = await seed();
    const before = await Order.countDocuments();
    const res = await request(app).get(PURGE).set('Authorization', `Bearer ${s.admin.token}`);
    expect(res.status).toBe(200);
    expect(res.body.confirmation).toBe(CONFIRMATION);
    expect(res.body.counts.orders).toBe(1); // only the simulated-payment order
    expect(res.body.sampleUsers).toContain('e2e_buyer@chopnow.app');
    expect(res.body.sampleUsers).not.toContain('realcustomer@gmail.com');
    expect(await Order.countDocuments()).toBe(before);
  });

  it('removes test data, keeps everything real, and fixes the numbers on what remains', async () => {
    const s = await seed();
    const res = await request(app)
      .post(PURGE)
      .set('Authorization', `Bearer ${s.admin.token}`)
      .send({ confirmation: CONFIRMATION });
    expect(res.status).toBe(200);
    expect(res.body.deleted.orders).toBe(1);
    expect(res.body.deleted.payments).toBe(1);
    expect(res.body.snapshot.orders).toHaveLength(1);
    // Snapshot of accounts never carries password hashes.
    res.body.snapshot.users.forEach((u) => expect(u.password).toBeUndefined());

    // Gone: the simulated order + its payment, the test buyer, and nothing that is real.
    expect(await Order.findById(s.fake.order._id)).toBeNull();
    expect(await Payment.findOne({ depositId: s.fake.depositId })).toBeNull();
    expect(await User.findById(s.tester.user._id)).toBeNull();
    expect(await Notification.countDocuments({ user: s.tester.user._id })).toBe(0);

    // Kept: real people, real order, real shop and listing.
    expect(await User.findById(s.customer.user._id)).not.toBeNull();
    expect(await User.findById(s.vendor.user._id)).not.toBeNull();
    expect(await Order.findById(s.real.order._id)).not.toBeNull();
    expect(await Listing.findById(s.listing._id)).not.toBeNull();
    expect(await Business.findById(s.vendor.business._id)).not.toBeNull();

    // Kept: the order paid with real money, with its customer, its test shop owner and listing.
    expect(await Order.findById(s.protectedOrder.order._id)).not.toBeNull();
    expect(await User.findById(s.realMoneyTester.user._id)).not.toBeNull();
    expect(await User.findById(s.testVendor.user._id)).not.toBeNull();
    expect(await Business.findById(s.testVendor.business._id)).not.toBeNull();
    expect(await Listing.findById(s.testListing._id)).not.toBeNull();

    // Kept: the admin who ran it.
    expect(await User.findById(s.admin.user._id)).not.toBeNull();

    // The real shop's order count now matches the orders that remain.
    const shop = await Business.findById(s.vendor.business._id).lean();
    expect(shop.stats.totalOrders).toBe(await Order.countDocuments({ business: shop._id }));

    // Running it again finds nothing more to do.
    const again = await request(app)
      .post(PURGE)
      .set('Authorization', `Bearer ${s.admin.token}`)
      .send({ confirmation: CONFIRMATION });
    expect(again.status).toBe(200);
    expect(again.body.deleted.orders).toBe(0);
    expect(again.body.deleted.users).toBe(0);
  });
});

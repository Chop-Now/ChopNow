/**
 * Test-data audit: read-only, and must never call a real order fake.
 */
const request = require('supertest');
const app = require('./app');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { auditTestData, looksLikeTestEmail } = require('../services/testDataAudit');
const {
  createAdmin,
  createBusinessOwnerWithBusiness,
  createConsumer,
  createListing,
  placePaidOrder,
  placePendingMobileMoneyOrder,
} = require('./fixtures');

describe('looksLikeTestEmail', () => {
  it.each([
    ['e2e_test_1790000000@chopnow.app', true],
    ['chopnow.e2e.audit.20260926@gmail.com', true],
    ['test@chopnow.app', true],
    ['test.user@gmail.com', true],
    ['consumer@example.com', true],
    ['jane+test@gmail.com', true],
    ['amina@gmail.com', false],
    ['testimony.k@gmail.com', false],
    ['ifegwuchibuezevictor@gmail.com', false],
    [null, false],
    [undefined, false],
  ])('%s -> %s', (email, expected) => {
    expect(looksLikeTestEmail(email)).toBe(expected);
  });
});

async function realUser(user, email) {
  await User.updateOne({ _id: user._id }, { $set: { email } });
}

describe('auditTestData', () => {
  async function seed() {
    // A genuine vendor and customer (fixtures use example.com, so rename them).
    const vendor = await createBusinessOwnerWithBusiness();
    await realUser(vendor.user, 'realvendor@gmail.com');
    const customer = await createConsumer();
    await realUser(customer.user, 'realcustomer@gmail.com');
    const tester = await createConsumer({ email: 'e2e_test_1@chopnow.app' });

    const listing = await createListing(vendor.business, { pricing: { price: 3000 } });
    const e2eListing = await createListing(vendor.business, { title: 'E2E Meal abc123' });

    // 1. Genuine paid order: must stay untouched.
    const real = await placePaidOrder(customer.token, listing);
    // 2. Order by a test account paid with a simulated (test-mode) payment.
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
    // 3. Genuine customer ordering an "E2E Meal" listing.
    const e2e = await placePaidOrder(customer.token, e2eListing);
    return { real, fake, e2e, vendor, customer, tester };
  }

  it('separates fake and test-looking data from the rest, and reads only', async () => {
    const { real, fake, e2e } = await seed();
    const before = await Payment.countDocuments();
    const audit = await auditTestData();

    expect(audit.provenFake.payments).toBe(1);
    expect(audit.provenFake.orders).toBe(1);
    // fake order + E2E-listing order; the genuine order is not included
    expect(audit.testLooking.orders).toBe(2);
    expect(audit.platform.orders).toBe(3);
    expect(audit.remainingIfTestRemoved.orders).toBe(1);
    expect(audit.testLooking.listings).toBeGreaterThanOrEqual(1);
    expect(audit.samples.users.map((u) => u.email)).toContain('e2e_test_1@chopnow.app');
    expect(audit.samples.users.map((u) => u.email)).not.toContain('realcustomer@gmail.com');
    expect(audit.samples.users.map((u) => u.email)).not.toContain('realvendor@gmail.com');

    // The E2E-listing order has a genuine-looking payment: it must be flagged.
    expect(audit.realLookingPayments).toHaveLength(1);
    expect(audit.realLookingPayments[0].providerTransactionId).toMatch(/^ptx-/);

    // Nothing was changed.
    expect(await Payment.countDocuments()).toBe(before);
    expect(real.order._id).toBeTruthy();
    expect(fake.order._id).toBeTruthy();
    expect(e2e.order._id).toBeTruthy();
  });

  it('is admin only over HTTP', async () => {
    const { token: consumerToken } = await createConsumer();
    const { token: adminToken } = await createAdmin();
    const url = '/api/v1/analytics/admin/data-audit';
    expect((await request(app).get(url)).status).toBe(401);
    expect(
      (await request(app).get(url).set('Authorization', `Bearer ${consumerToken}`)).status
    ).toBe(403);
    const res = await request(app).get(url).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.platform).toBeDefined();
  });
});

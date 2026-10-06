/**
 * Read-only audit: how much of what is in the database looks like test data?
 *
 * Nothing here changes anything. It sorts records into:
 *  - PROVEN FAKE: payments the server's own payment test mode created
 *    (providerTransactionId "TEST-..." / rawCallbackData.simulated), and the
 *    orders they paid. These never moved real money.
 *  - TEST-LOOKING: accounts with obvious test emails (e2e, test@, example.com),
 *    their businesses, listings titled "E2E ...", and any order that touches
 *    one of those. These are likely test data but are a judgement call, so
 *    they are listed for a person to confirm.
 *  - Everything else is left alone and reported as the "remaining" figures.
 *
 * An order that has a completed payment which is NOT simulated is flagged as
 * "real-looking payment" so it can never be mistaken for fake data.
 */
const User = require('../models/User');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const SAMPLE = 100;

const TEST_EMAIL = [
  /e2e/i, // e2e_test_..., chopnow.e2e.audit...
  /^test(?![a-z])/i, // test@..., test.user@..., test1@...
  /@example\.(com|org|net)$/i,
  /\+test/i,
  /@test\.com$/i, // consumer_1788047439132@test.com, vendor_...@test.com
  /@yopmail\.com$/i, // disposable inboxes used by the old test scripts
];

const looksLikeTestEmail = (email) =>
  typeof email === 'string' && TEST_EMAIL.some((re) => re.test(email));

const ids = (docs) => docs.map((d) => d._id);

/**
 * Finds everything that looks like test data, without changing anything. Shared by the
 * read-only audit and the purge so both always agree on what "test data" means.
 */
async function findTestRecords() {
  // ── proven fake payments and the orders they paid ──────────────────────
  const fakePayments = await Payment.find({
    $or: [{ providerTransactionId: /^TEST-/ }, { 'rawCallbackData.simulated': true }],
  })
    .select('order orders amount status')
    .lean();
  const fakeOrderIds = new Set();
  fakePayments.forEach((p) => {
    if (p.order) fakeOrderIds.add(String(p.order));
    (p.orders || []).forEach((o) => fakeOrderIds.add(String(o)));
  });

  // ── test-looking accounts, businesses, listings ────────────────────────
  const allUsers = await User.find({}).select('email firstName lastName roles createdAt').lean();
  const testUsers = allUsers.filter((u) => looksLikeTestEmail(u.email));
  const testUserIds = ids(testUsers);

  const testBusinesses = await Business.find({ owner: { $in: testUserIds } })
    .select('name owner stats.balance createdAt')
    .lean();
  const testBusinessIds = ids(testBusinesses);

  const testListings = await Listing.find({
    $or: [{ title: /^E2E\b/i }, { business: { $in: testBusinessIds } }],
  })
    .select('title business status createdAt')
    .lean();
  const testListingIds = ids(testListings);

  // ── orders that are, or touch, any of the above ────────────────────────
  const orderMatch = {
    $or: [
      { _id: { $in: [...fakeOrderIds] } },
      { customer: { $in: testUserIds } },
      { business: { $in: testBusinessIds } },
      { listing: { $in: testListingIds } },
      { 'items.listing': { $in: testListingIds } },
      { 'items.title': /^E2E\b/i },
    ],
  };
  const orderFields = 'orderNumber status pricing.total createdAt statusTimestamps';
  const testOrders = await Order.find(orderMatch).select(orderFields).lean();

  // Orders whose customer or shop no longer exists at all (old test scripts removed their
  // accounts but left the orders, some marked "completed" with the payment never made).
  // They count towards revenue and orders but belong to nobody.
  const existingBusinessIds = await Business.distinct('_id');
  const orphanOrders = await Order.find({
    $or: [{ customer: { $nin: ids(allUsers) } }, { business: { $nin: existingBusinessIds } }],
  })
    .select(orderFields)
    .lean();
  const known = new Set(ids(testOrders).map(String));
  orphanOrders.forEach((o) => {
    if (!known.has(String(o._id))) testOrders.push(o);
  });
  const testOrderIds = new Set(ids(testOrders).map(String));

  // Orders with a completed payment that is not simulated: never call these fake.
  const realLooking = await Payment.find({
    status: 'completed',
    providerTransactionId: { $not: /^TEST-/ },
    'rawCallbackData.simulated': { $ne: true },
    $or: [{ order: { $in: [...testOrderIds] } }, { orders: { $in: [...testOrderIds] } }],
  })
    .select('order orders amount providerTransactionId createdAt')
    .lean();

  return {
    fakePayments,
    fakeOrderIds,
    allUsers,
    testUsers,
    testBusinesses,
    testListings,
    testOrders,
    testOrderIds,
    realLooking,
  };
}

async function auditTestData() {
  const {
    fakePayments,
    fakeOrderIds,
    allUsers,
    testUsers,
    testBusinesses,
    testListings,
    testOrders,
    realLooking,
  } = await findTestRecords();

  // ── totals, and what would remain ──────────────────────────────────────
  const [totals] = await Order.aggregate([
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        completedRevenue: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.total', 0] },
        },
      },
    },
  ]);
  const completedTest = testOrders.filter((o) => o.status === 'completed');
  const testRevenue = completedTest.reduce((s, o) => s + (o.pricing?.total || 0), 0);

  const byMonth = {};
  for (const o of completedTest) {
    const d = o.statusTimestamps?.completedAt || o.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + (o.pricing?.total || 0);
  }

  const businessesTotal = await Business.countDocuments();
  const listingsTotal = await Listing.countDocuments();

  return {
    generatedAt: new Date(),
    provenFake: {
      payments: fakePayments.length,
      paymentAmount: fakePayments.reduce((s, p) => s + (p.amount || 0), 0),
      orders: fakeOrderIds.size,
    },
    testLooking: {
      users: testUsers.length,
      businesses: testBusinesses.length,
      businessBalanceOwed: testBusinesses.reduce((s, b) => s + (b.stats?.balance || 0), 0),
      listings: testListings.length,
      orders: testOrders.length,
      completedOrders: completedTest.length,
      completedRevenue: testRevenue,
      revenueByMonth: byMonth,
    },
    realLookingPayments: realLooking.map((p) => ({
      amount: p.amount,
      providerTransactionId: p.providerTransactionId,
      createdAt: p.createdAt,
    })),
    platform: {
      users: allUsers.length,
      businesses: businessesTotal,
      listings: listingsTotal,
      orders: totals?.orders || 0,
      completedOrders: totals?.completed || 0,
      completedRevenue: totals?.completedRevenue || 0,
    },
    remainingIfTestRemoved: {
      users: allUsers.length - testUsers.length,
      businesses: businessesTotal - testBusinesses.length,
      listings: listingsTotal - testListings.length,
      orders: (totals?.orders || 0) - testOrders.length,
      completedRevenue: (totals?.completedRevenue || 0) - testRevenue,
    },
    samples: {
      users: testUsers.slice(0, SAMPLE).map((u) => ({
        email: u.email,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        createdAt: u.createdAt,
      })),
      businesses: testBusinesses.slice(0, SAMPLE).map((b) => ({
        name: b.name,
        balance: b.stats?.balance || 0,
        createdAt: b.createdAt,
      })),
      listings: testListings.slice(0, SAMPLE).map((l) => ({
        title: l.title,
        status: l.status,
        createdAt: l.createdAt,
      })),
    },
  };
}

module.exports = { auditTestData, findTestRecords, looksLikeTestEmail };

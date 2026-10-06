/**
 * Removes test data from the database, safely. Authorised by the owner on 2026-10-07.
 *
 * "Test data" is exactly what services/testDataAudit.js reports: payments made by the
 * server's own test mode, accounts with test emails, their shops and listings, and every
 * order that touches any of them. On top of that, this guards what must never go:
 *  - any admin account, and the admin running the purge;
 *  - any order paid with a real (non-simulated, completed) payment, plus the customer,
 *    shop and listings that order points at - real money is never deleted;
 *  - a payment that also covers an order that is staying.
 *
 * `buildPlan()` only reads. `purge()` deletes children before parents, so running it again
 * after a failure finishes the job. It returns a snapshot of what it removed.
 */
const mongoose = require('mongoose');
const User = require('../models/User');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const RefundRequest = require('../models/RefundRequest');
const Dispute = require('../models/Dispute');
const Review = require('../models/Review');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const BalanceTransaction = require('../models/BalanceTransaction');
const Payout = require('../models/Payout');
const Cart = require('../models/Cart');
const Favorite = require('../models/Favorite');
const logger = require('../utils/logger');
const { REAL_ORDERS } = require('../utils/orderFilters');
const { findTestRecords } = require('./testDataAudit');
const { rebuildImpactTotals } = require('./impactService');

const CONFIRMATION = 'DELETE TEST DATA';

const str = (v) => (v === null || v === undefined ? null : String(v));
const oid = (id) => new mongoose.Types.ObjectId(id);
const toIds = (set) => [...set].map(oid);

async function buildPlan({ actorId } = {}) {
  const rec = await findTestRecords();

  // ── what is protected ──────────────────────────────────────────────────
  const protectedOrderIds = new Set();
  if (rec.realLooking.length) {
    const links = await Payment.find({ _id: { $in: rec.realLooking.map((p) => p._id) } })
      .select('order orders')
      .lean();
    links.forEach((p) => {
      if (p.order) protectedOrderIds.add(str(p.order));
      (p.orders || []).forEach((o) => protectedOrderIds.add(str(o)));
    });
  }

  const keptUsers = new Set();
  const keptBusinesses = new Set();
  const keptListings = new Set();
  if (actorId) keptUsers.add(str(actorId));
  rec.testUsers.forEach((u) => {
    if ((u.roles || []).includes('admin')) keptUsers.add(str(u._id));
  });
  if (protectedOrderIds.size) {
    const protectedOrders = await Order.find({ _id: { $in: toIds(protectedOrderIds) } })
      .select('customer business listing items.listing')
      .lean();
    protectedOrders.forEach((o) => {
      if (o.customer) keptUsers.add(str(o.customer));
      if (o.business) keptBusinesses.add(str(o.business));
      if (o.listing) keptListings.add(str(o.listing));
      (o.items || []).forEach((i) => i.listing && keptListings.add(str(i.listing)));
    });
  }
  // A kept listing keeps its shop, and a kept shop keeps its owner.
  if (keptListings.size) {
    const shops = await Listing.find({ _id: { $in: toIds(keptListings) } })
      .select('business')
      .lean();
    shops.forEach((l) => l.business && keptBusinesses.add(str(l.business)));
  }
  if (keptBusinesses.size) {
    const owners = await Business.find({ _id: { $in: toIds(keptBusinesses) } })
      .select('owner')
      .lean();
    owners.forEach((b) => b.owner && keptUsers.add(str(b.owner)));
  }

  // ── what goes ──────────────────────────────────────────────────────────
  const orderIds = new Set(
    [...rec.testOrderIds, ...rec.fakeOrderIds].filter((id) => !protectedOrderIds.has(id))
  );
  const userIds = new Set(rec.testUsers.map((u) => str(u._id)).filter((id) => !keptUsers.has(id)));
  const businessIds = new Set(
    rec.testBusinesses.map((b) => str(b._id)).filter((id) => !keptBusinesses.has(id))
  );
  const listingIds = new Set(
    rec.testListings.map((l) => str(l._id)).filter((id) => !keptListings.has(id))
  );

  // Listings of a deleted shop go with it, even if their title looks normal.
  if (businessIds.size) {
    const shopListings = await Listing.find({ business: { $in: toIds(businessIds) } })
      .select('_id')
      .lean();
    shopListings.forEach((l) => {
      if (!keptListings.has(str(l._id))) listingIds.add(str(l._id));
    });
  }

  // Any order that belongs to something being deleted goes too (unless protected).
  const dependent = await Order.find({
    $or: [
      { customer: { $in: toIds(userIds) } },
      { business: { $in: toIds(businessIds) } },
      { listing: { $in: toIds(listingIds) } },
      { 'items.listing': { $in: toIds(listingIds) } },
    ],
  })
    .select('_id')
    .lean();
  dependent.forEach((o) => {
    if (!protectedOrderIds.has(str(o._id))) orderIds.add(str(o._id));
  });

  // Payments go only when every order they cover is going.
  const paymentCandidates = await Payment.find({
    $or: [{ order: { $in: toIds(orderIds) } }, { orders: { $in: toIds(orderIds) } }],
  })
    .select('order orders')
    .lean();
  const paymentIds = new Set();
  paymentCandidates.forEach((p) => {
    const covered = [p.order, ...(p.orders || [])].filter(Boolean).map(str);
    if (covered.every((id) => orderIds.has(id))) paymentIds.add(str(p._id));
  });

  return {
    counts: {
      users: userIds.size,
      businesses: businessIds.size,
      listings: listingIds.size,
      orders: orderIds.size,
      payments: paymentIds.size,
    },
    kept: {
      ordersWithRealPayments: protectedOrderIds.size,
      accountsKept: keptUsers.size,
      shopsKept: keptBusinesses.size,
      listingsKept: keptListings.size,
    },
    ids: { userIds, businessIds, listingIds, orderIds, paymentIds },
  };
}

/** What would be removed, without removing anything. */
async function preview({ actorId } = {}) {
  const plan = await buildPlan({ actorId });
  const [users, businesses] = await Promise.all([
    User.find({ _id: { $in: toIds(plan.ids.userIds) } })
      .select('email')
      .lean(),
    Business.find({ _id: { $in: toIds(plan.ids.businessIds) } })
      .select('name')
      .lean(),
  ]);
  return {
    counts: plan.counts,
    kept: plan.kept,
    confirmation: CONFIRMATION,
    sampleUsers: users.map((u) => u.email).slice(0, 200),
    sampleShops: businesses.map((b) => b.name).slice(0, 200),
  };
}

async function purge({ actorId, confirmation }) {
  if (confirmation !== CONFIRMATION) {
    const err = new Error(`Type "${CONFIRMATION}" to confirm.`);
    err.status = 400;
    throw err;
  }
  const plan = await buildPlan({ actorId });
  const users = toIds(plan.ids.userIds);
  const businesses = toIds(plan.ids.businessIds);
  const listings = toIds(plan.ids.listingIds);
  const orders = toIds(plan.ids.orderIds);
  const payments = toIds(plan.ids.paymentIds);

  // Snapshot first, so what was removed can be inspected afterwards. Accounts keep only
  // identifying fields - never password hashes or tokens. (The database backup is the
  // real restore point; this is the record of what the purge touched.)
  const snapshot = {
    takenAt: new Date(),
    users: await User.find({ _id: { $in: users } })
      .select('email firstName lastName roles createdAt')
      .lean(),
    businesses: await Business.find({ _id: { $in: businesses } }).lean(),
    listings: await Listing.find({ _id: { $in: listings } }).lean(),
    orders: await Order.find({ _id: { $in: orders } }).lean(),
    payments: await Payment.find({ _id: { $in: payments } }).lean(),
  };

  const deleted = {};
  const del = async (name, model, filter) => {
    deleted[name] = (await model.deleteMany(filter)).deletedCount;
  };

  // Children first.
  await del('payments', Payment, { _id: { $in: payments } });
  await del('refundRequests', RefundRequest, {
    $or: [
      { order: { $in: orders } },
      { business: { $in: businesses } },
      { customer: { $in: users } },
    ],
  });
  await del('disputes', Dispute, {
    $or: [
      { order: { $in: orders } },
      { business: { $in: businesses } },
      { customer: { $in: users } },
    ],
  });
  await del('reviews', Review, {
    $or: [
      { order: { $in: orders } },
      { business: { $in: businesses } },
      { customer: { $in: users } },
    ],
  });
  await del('deliveries', Delivery, {
    $or: [{ order: { $in: orders } }, { rider: { $in: users } }],
  });
  await del('notifications', Notification, {
    $or: [
      { user: { $in: users } },
      { relatedOrder: { $in: orders } },
      { relatedListing: { $in: listings } },
      { relatedBusiness: { $in: businesses } },
    ],
  });
  await del('balanceTransactions', BalanceTransaction, {
    $or: [{ order: { $in: orders } }, { business: { $in: businesses } }, { user: { $in: users } }],
  });
  await del('payouts', Payout, {
    $or: [{ business: { $in: businesses } }, { user: { $in: users } }],
  });
  await del('carts', Cart, { user: { $in: users } });
  await Cart.updateMany({}, { $pull: { items: { listing: { $in: listings } } } });
  await del('favorites', Favorite, {
    $or: [
      { user: { $in: users } },
      { business: { $in: businesses } },
      { listing: { $in: listings } },
    ],
  });
  await del('orders', Order, { _id: { $in: orders } });
  await del('listings', Listing, { _id: { $in: listings } });
  await del('businesses', Business, { _id: { $in: businesses } });
  await del('users', User, { _id: { $in: users } });

  // Numbers kept on what remains must match what remains.
  const impact = await rebuildImpactTotals();
  const remaining = await Business.find({}).select('_id').lean();
  for (const b of remaining) {
    const [totalOrders, totalListings, ratings] = await Promise.all([
      Order.countDocuments({ business: b._id, ...REAL_ORDERS }),
      Listing.countDocuments({ business: b._id, status: { $ne: 'deleted' } }),
      Review.calculateAverageRating(b._id),
    ]);
    await Business.updateOne(
      { _id: b._id },
      {
        $set: {
          'stats.totalOrders': totalOrders,
          'stats.totalListings': totalListings,
          'stats.averageRating': ratings.averageRating,
          'stats.reviewCount': ratings.reviewCount,
          'rating.average': ratings.averageRating,
          'rating.count': ratings.reviewCount,
        },
      }
    );
  }

  logger.warn({ actorId: str(actorId), deleted, kept: plan.kept }, 'Test data purged');
  return { deleted, kept: plan.kept, impact, snapshot };
}

module.exports = { buildPlan, preview, purge, CONFIRMATION };

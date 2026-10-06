/**
 * Records, adjusts and backfills the estimated environmental impact of orders.
 *
 * The maths lives in config/impactFactors.js. This file is the bookkeeping:
 *
 *  - recordOrderImpact: when an order completes, work out its impact once, store
 *    it on the order (per item and in total) and add it to the vendor's and the
 *    customer's running totals.
 *  - syncOrderImpactWithRefunds: when part or all of an order is refunded, take
 *    the same share of impact back (and give it back if a refund fails), so a
 *    refunded meal is not counted as rescued.
 *  - backfillOrderImpact: gives orders completed before this existed an impact
 *    and rebuilds the running totals from them.
 *
 * Running totals are therefore always: sum over completed orders of
 * gross x (1 - reversedFraction).
 */
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const Business = require('../models/Business');
const User = require('../models/User');
const RefundRequest = require('../models/RefundRequest');
const logger = require('../utils/logger');
const { FACTORS_VERSION, impactForItems } = require('../config/impactFactors');

const r4 = (n) => Math.round((n + Number.EPSILON) * 1e4) / 1e4;

const withSession = (query, session) => (session ? query.session(session) : query);

/** Category and unit for each listing in an order, keyed by String(listing id). */
async function loadListingInfo(items, session) {
  const ids = [
    ...new Set(
      (items || []).map((i) => String(i?.listing?._id || i?.listing || '')).filter(Boolean)
    ),
  ];
  if (ids.length === 0) return new Map();
  const docs = await withSession(
    Listing.find({ _id: { $in: ids } })
      .select('category inventory.unit')
      .lean(),
    session
  );
  return new Map(
    docs.map((d) => [String(d._id), { category: d.category, unit: d.inventory?.unit }])
  );
}

/**
 * Share (0..1) of an order's value that has been, or is being, refunded because
 * of a customer problem with it (a resolved dispute). Refunds that are not about
 * the food - a cancelled order's money, or the extra payment from paying twice -
 * carry no dispute and do not change what was rescued.
 */
async function refundedFraction(order, session) {
  const total = order.pricing?.total || 0;
  if (total <= 0) return 0;
  const rows = await withSession(
    RefundRequest.aggregate([
      { $match: { order: order._id, status: { $ne: 'failed' }, dispute: { $ne: null } } },
      { $group: { _id: null, refunded: { $sum: '$amount' } } },
    ]),
    session
  );
  const refunded = rows[0]?.refunded || 0;
  return Math.min(1, Math.max(0, refunded / total));
}

/** The $inc that adds `multiplier` x gross impact to a Business document. */
function businessInc(gross, multiplier) {
  return {
    'stats.impact.mealsRescued': r4(gross.meals * multiplier),
    'stats.impact.kgSaved': r4(gross.kg * multiplier),
    'stats.impact.co2Saved': r4(gross.co2e * multiplier),
    'stats.impact.waterSaved': r4(gross.water * multiplier),
    'metrics.mealsSaved': r4(gross.meals * multiplier),
    'metrics.co2Saved': r4(gross.co2e * multiplier),
  };
}

/** The $inc that adds `multiplier` x gross impact to a customer's User document. */
function customerInc(gross, multiplier) {
  return {
    'stats.impact.meals': r4(gross.meals * multiplier),
    'stats.impact.kgSaved': r4(gross.kg * multiplier),
    'stats.impact.co2Saved': r4(gross.co2e * multiplier),
    'stats.impact.waterSaved': r4(gross.water * multiplier),
  };
}

async function applyDelta(order, gross, multiplier, session) {
  if (multiplier === 0) return;
  const opts = session ? { session } : {};
  await Business.updateOne(
    { _id: order.business._id || order.business },
    { $inc: businessInc(gross, multiplier) },
    opts
  );
  await User.updateOne(
    { _id: order.customer._id || order.customer },
    { $inc: customerInc(gross, multiplier) },
    opts
  );
}

/**
 * Computes and stores the impact of a just-completed order, exactly once.
 * Call inside the completion transaction, after the status change.
 * @returns {Promise<object|null>} the stored order.impact, or null if the order
 *   already had impact recorded (or does not exist).
 */
async function recordOrderImpact(order, session) {
  const listingInfo = await loadListingInfo(order.items, session);
  const { items: lines, totals } = impactForItems(order.items, listingInfo);
  const fraction = await refundedFraction(order, session);

  const set = {
    impact: {
      version: FACTORS_VERSION,
      meals: totals.meals,
      kg: totals.kg,
      co2e: totals.co2e,
      water: totals.water,
      reversedFraction: r4(fraction),
      countedAt: new Date(),
    },
  };
  lines.forEach((line, index) => {
    set[`items.${index}.impact`] = {
      category: line.category,
      basis: line.basis,
      unitKg: line.unitKg,
      kg: line.kg,
      co2e: line.co2e,
      water: line.water,
    };
  });

  // Only the first writer wins; a repeat call changes nothing.
  const res = await Order.updateOne(
    { _id: order._id, 'impact.countedAt': { $exists: false } },
    { $set: set },
    session ? { session } : {}
  );
  if (res.modifiedCount === 0) return null;

  await applyDelta(order, totals, 1 - fraction, session);
  return set.impact;
}

/**
 * Brings an order's counted impact in line with the refunds against it: a 40%
 * refund means 40% of the order's impact no longer counts. Safe to call any
 * number of times; it only moves the difference. Returns the new fraction, or
 * null when the order has no recorded impact yet (it will be netted at completion).
 */
async function syncOrderImpactWithRefunds(orderId, session) {
  const order = await withSession(
    Order.findById(orderId).select('business customer pricing.total impact'),
    session
  );
  if (!order?.impact?.countedAt) return null;

  const fraction = r4(await refundedFraction(order, session));
  const previous = order.impact.reversedFraction || 0;
  const delta = r4(fraction - previous);
  if (delta === 0) return fraction;

  const gross = {
    meals: order.impact.meals || 0,
    kg: order.impact.kg || 0,
    co2e: order.impact.co2e || 0,
    water: order.impact.water || 0,
  };
  const opts = session ? { session } : {};
  await Order.updateOne(
    { _id: order._id },
    { $set: { 'impact.reversedFraction': fraction } },
    opts
  );
  await applyDelta(order, gross, -delta, session);
  return fraction;
}

/**
 * Orders completed before impact was recorded get one now, and every vendor's
 * and customer's running totals are rebuilt from the orders (replacing the old
 * flat-rate numbers). Idempotent: orders that already have impact are skipped,
 * and when nothing needed filling in, nothing is touched.
 * @returns {Promise<{orders: number, businesses: number, customers: number}>}
 */
async function backfillOrderImpact({ batchSize = 200 } = {}) {
  let orders = 0;
  const cursor = Order.find({ status: 'completed', 'impact.countedAt': { $exists: false } })
    .select('items business customer pricing.total statusTimestamps')
    .cursor({ batchSize });

  for await (const order of cursor) {
    const listingInfo = await loadListingInfo(order.items);
    const { items: lines, totals } = impactForItems(order.items, listingInfo);
    const fraction = await refundedFraction(order);
    const set = {
      impact: {
        version: FACTORS_VERSION,
        meals: totals.meals,
        kg: totals.kg,
        co2e: totals.co2e,
        water: totals.water,
        reversedFraction: r4(fraction),
        countedAt: order.statusTimestamps?.completedAt || new Date(),
      },
    };
    lines.forEach((line, index) => {
      set[`items.${index}.impact`] = {
        category: line.category,
        basis: line.basis,
        unitKg: line.unitKg,
        kg: line.kg,
        co2e: line.co2e,
        water: line.water,
      };
    });
    await Order.updateOne(
      { _id: order._id, 'impact.countedAt': { $exists: false } },
      { $set: set }
    );
    orders += 1;
  }

  if (orders === 0) return { orders: 0, businesses: 0, customers: 0 };

  const { businesses, customers } = await rebuildImpactTotals();
  return { orders, businesses, customers };
}

/**
 * Rebuilds every vendor's and customer's impact totals from the completed orders that exist
 * now. Used after backfilling, and after orders are removed (the test-data purge). Anyone
 * with no completed orders left reads zero.
 */
async function rebuildImpactTotals() {
  const netStage = {
    $project: {
      business: 1,
      customer: 1,
      f: { $subtract: [1, { $ifNull: ['$impact.reversedFraction', 0] }] },
      meals: '$impact.meals',
      kg: '$impact.kg',
      co2e: '$impact.co2e',
      water: '$impact.water',
    },
  };
  const sums = (key) => ({
    meals: { $sum: { $multiply: ['$meals', '$f'] } },
    kg: { $sum: { $multiply: ['$kg', '$f'] } },
    co2e: { $sum: { $multiply: ['$co2e', '$f'] } },
    water: { $sum: { $multiply: ['$water', '$f'] } },
    _id: `$${key}`,
  });
  const base = [
    { $match: { status: 'completed', 'impact.countedAt': { $exists: true } } },
    netStage,
  ];

  const perBusiness = await Order.aggregate([...base, { $group: sums('business') }]);
  const perCustomer = await Order.aggregate([...base, { $group: sums('customer') }]);

  // Anyone with no completed orders left must read zero, not their old flat-rate total.
  await Business.updateMany(
    { _id: { $nin: perBusiness.map((b) => b._id) } },
    {
      $set: {
        'stats.impact.mealsRescued': 0,
        'stats.impact.kgSaved': 0,
        'stats.impact.co2Saved': 0,
        'stats.impact.waterSaved': 0,
        'metrics.mealsSaved': 0,
        'metrics.co2Saved': 0,
      },
    }
  );
  for (const b of perBusiness) {
    await Business.updateOne(
      { _id: b._id },
      {
        $set: {
          'stats.impact.mealsRescued': r4(b.meals),
          'stats.impact.kgSaved': r4(b.kg),
          'stats.impact.co2Saved': r4(b.co2e),
          'stats.impact.waterSaved': r4(b.water),
          'metrics.mealsSaved': r4(b.meals),
          'metrics.co2Saved': r4(b.co2e),
        },
      }
    );
  }
  await User.updateMany(
    { _id: { $nin: perCustomer.map((c) => c._id) }, 'stats.impact.meals': { $gt: 0 } },
    {
      $set: {
        'stats.impact.meals': 0,
        'stats.impact.kgSaved': 0,
        'stats.impact.co2Saved': 0,
        'stats.impact.waterSaved': 0,
      },
    }
  );
  for (const c of perCustomer) {
    await User.updateOne(
      { _id: c._id },
      {
        $set: {
          'stats.impact.meals': r4(c.meals),
          'stats.impact.kgSaved': r4(c.kg),
          'stats.impact.co2Saved': r4(c.co2e),
          'stats.impact.waterSaved': r4(c.water),
        },
      }
    );
  }

  return { businesses: perBusiness.length, customers: perCustomer.length };
}

/** Called once at startup: fills in history in the background if any is missing. */
async function ensureImpactBackfilled() {
  try {
    const missing = await Order.exists({
      status: 'completed',
      'impact.countedAt': { $exists: false },
    });
    if (!missing) return;
    const result = await backfillOrderImpact();
    logger.info(result, 'Backfilled order impact');
  } catch (err) {
    logger.error({ err }, 'Impact backfill failed');
  }
}

module.exports = {
  recordOrderImpact,
  syncOrderImpactWithRefunds,
  backfillOrderImpact,
  rebuildImpactTotals,
  ensureImpactBackfilled,
  refundedFraction,
};

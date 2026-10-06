const Order = require('../models/Order');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Delivery = require('../models/Delivery');
const Payout = require('../models/Payout');
const Cart = require('../models/Cart');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');

// Orders that someone is still waiting on (paid for, not yet completed or cancelled)
const IN_PROGRESS_ORDER = [
  'paid',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
];
const IN_PROGRESS_DELIVERY = ['assigned', 'picked_up', 'in_transit'];

/**
 * Deleting an account must not strand other people: a buyer waiting on food, a vendor
 * who still has customers to serve or money in their balance, a rider mid-delivery.
 *
 * @returns {Promise<string|null>} why the account cannot be deleted yet, or null if it can
 */
async function findDeletionBlocker(user) {
  const buying = await Order.exists({ customer: user._id, status: { $in: IN_PROGRESS_ORDER } });
  if (buying) {
    return 'This account has an order in progress. It can be deleted once the order is completed or cancelled.';
  }

  const businesses = await Business.find({ owner: user._id }).select('stats.balance');
  if (businesses.length) {
    const ids = businesses.map((b) => b._id);
    if (await Order.exists({ business: { $in: ids }, status: { $in: IN_PROGRESS_ORDER } })) {
      return 'This business still has orders in progress. They need to be completed or cancelled first.';
    }
    if (
      await Payout.exists({ business: { $in: ids }, status: { $in: ['requested', 'processing'] } })
    ) {
      return 'A payout for this business is still being processed.';
    }
    const owed = businesses.reduce((sum, b) => sum + (b.stats?.balance || 0), 0);
    if (owed > 0) {
      return `This business still has RWF ${owed.toLocaleString('en-US')} in its balance. Request a payout before closing the account.`;
    }
  }

  if (await Delivery.exists({ rider: user._id, status: { $in: IN_PROGRESS_DELIVERY } })) {
    return 'This rider has a delivery in progress.';
  }
  return null;
}

/**
 * Tidy up what the user leaves behind: their shop stops appearing to customers (the
 * records stay, because past orders and payouts refer to them) and personal leftovers go.
 */
async function retireAccountData(user) {
  const businesses = await Business.find({ owner: user._id }).select('_id');
  const ids = businesses.map((b) => b._id);
  if (ids.length) {
    await Business.updateMany({ _id: { $in: ids } }, { status: 'inactive' });
    await Listing.updateMany({ business: { $in: ids }, status: 'active' }, { status: 'inactive' });
  }
  await Promise.all([
    Cart.deleteMany({ user: user._id }),
    Favorite.deleteMany({ user: user._id }),
    Notification.deleteMany({ user: user._id }),
  ]);
}

module.exports = { findDeletionBlocker, retireAccountData };

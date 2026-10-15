/**
 * What each person may see of an order's money.
 *
 * An order's customer total is made of: the items, the delivery fee (collected for the courier and
 * passed on), and tax. Only the items are the vendor's business: the vendor earns the item price
 * minus ChopNow's fee. So a vendor is never shown the delivery fee or what the courier charged;
 * that is between ChopNow and the courier. Customers and admins see everything.
 */

const plain = (order) => (typeof order?.toObject === 'function' ? order.toObject() : { ...order });

/** The money fields a vendor is allowed to see, with total = what the customer paid for the items. */
const vendorPricing = (pricing = {}) => ({
  currency: pricing.currency,
  subtotal: pricing.subtotal,
  platformFee: pricing.platformFee,
  platformFeePercent: pricing.platformFeePercent,
  vendorAmount: pricing.vendorAmount,
  vendorRefunded: pricing.vendorRefunded,
  total: pricing.subtotal,
});

/**
 * An order as its customer sees it. The delivery fee is theirs (they paid it); what the courier
 * actually charged ChopNow is not.
 */
const forCustomer = (order) => {
  if (!order) return order;
  const view = plain(order);
  if (view.courier) {
    const { quotedRwf: _quoted, bookedRwf: _booked, ...visible } = view.courier;
    view.courier = visible;
  }
  return view;
};

/** An order as its vendor sees it. Returns a plain object; the original is not changed. */
const forVendor = (order) => {
  if (!order) return order;
  const view = plain(order);
  view.pricing = vendorPricing(view.pricing);
  // The vendor needs to know a rider is booked, and the reference to quote; not what it cost.
  if (view.courier) {
    view.courier = {
      provider: view.courier.provider,
      bookingReference: view.courier.bookingReference,
      bookedAt: view.courier.bookedAt,
    };
  }
  // Own-rider delivery records carry their own fee.
  if (view.delivery && typeof view.delivery === 'object') {
    const { deliveryFee: _fee, ...rest } = view.delivery;
    view.delivery = rest;
  }
  return view;
};

module.exports = { forVendor, forCustomer, vendorPricing };

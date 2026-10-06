// A checkout nobody paid for (a mobile-money order left in "pending payment", or one that was
// cancelled/expired without the money arriving) was never really an order. Vendors must not be
// shown it as something to accept, and counting it inflates every "Total Orders" figure.
const REAL_ORDERS = {
  $nor: [
    { status: 'pending_payment', 'payment.paymentMethod': 'mobile_money' },
    {
      status: 'cancelled',
      'payment.paymentMethod': 'mobile_money',
      'payment.paymentStatus': { $nin: ['completed', 'refund_pending', 'refunded'] },
    },
  ],
};

module.exports = { REAL_ORDERS };

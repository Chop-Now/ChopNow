/**
 * A delivery order's money is split three ways and each person sees only their part:
 *  - the vendor: the items, ChopNow's fee on them, and what they earn - never the delivery fee;
 *  - ChopNow (admin): everything, with the delivery fee kept apart from revenue;
 *  - the customer: everything they paid.
 * And an order with a courier booking can no longer be cancelled by anyone.
 */
const request = require('supertest');
const app = require('./app');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const PlatformSettings = require('../models/PlatformSettings');
const {
  createAdmin,
  createBusinessOwnerWithBusiness,
  createConsumer,
  createListing,
  placePaidOrder,
} = require('./fixtures');

const DROP = { address: 'KG 108 Street, Remera', location: { lat: -1.958722, lng: 30.119739 } };

async function deliveryOrder({ booked = true } = {}) {
  const settings = await PlatformSettings.getSettings();
  settings.deliveryFee = 1500;
  settings.deliveryCommissionPercent = 0;
  settings.platformFeePercent = 10;
  await settings.save();

  const vendor = await createBusinessOwnerWithBusiness({ name: 'Kigali Bakery' });
  const listing = await createListing(vendor.business, {
    fulfillment: 'delivery',
    pricing: { price: 3000 },
  });
  const customer = await createConsumer();
  const { order } = await placePaidOrder(customer.token, listing, {
    fulfillmentType: 'delivery',
    deliveryDetails: DROP,
  });
  if (booked) {
    await Order.updateOne(
      { _id: order._id },
      {
        $set: {
          status: 'out_for_delivery',
          courier: {
            provider: 'moving_man',
            quotedRwf: 1400,
            distanceKm: 4,
            bookingReference: 'MM-1010-A01',
            bookedRwf: 1350,
            bookedAt: new Date(),
          },
        },
      }
    );
  }
  const admin = await createAdmin();
  return { vendor, customer, admin, order };
}

const get = (url, token) => request(app).get(url).set('Authorization', `Bearer ${token}`);

describe('what each person sees of a delivery order', () => {
  it('shows the vendor the items and their earnings, never the delivery money', async () => {
    const { vendor, order } = await deliveryOrder();

    const list = await get('/api/v1/orders', vendor.token);
    expect(list.status).toBe(200);
    const row = list.body.orders.find((o) => o._id === order._id);
    expect(row.pricing.subtotal).toBe(3000);
    expect(row.pricing.total).toBe(3000); // items only
    expect(row.pricing.vendorAmount).toBe(2700);
    expect(row.pricing.deliveryFee).toBeUndefined();
    expect(row.pricing.deliveryCommission).toBeUndefined();
    expect(row.pricing.riderAmount).toBeUndefined();
    expect(row.pricing.tax).toBeUndefined();
    // the booking reference is shown (so a late delivery can be chased), not its cost
    expect(row.courier.bookingReference).toBe('MM-1010-A01');
    expect(row.courier.quotedRwf).toBeUndefined();
    expect(row.courier.bookedRwf).toBeUndefined();

    const one = await get(`/api/v1/orders/${order._id}`, vendor.token);
    expect(one.body.pricing.deliveryFee).toBeUndefined();
    expect(one.body.pricing.total).toBe(3000);
    expect(one.body.courier.bookedRwf).toBeUndefined();
  });

  it('shows the customer everything they paid, and the admin everything', async () => {
    const { customer, admin, order } = await deliveryOrder();
    const mine = await get(`/api/v1/orders/${order._id}`, customer.token);
    expect(mine.body.pricing.deliveryFee).toBe(1500);
    expect(mine.body.pricing.total).toBe(4500);
    const all = await get(`/api/v1/orders/${order._id}`, admin.token);
    expect(all.body.pricing.deliveryFee).toBe(1500);
    expect(all.body.courier.bookedRwf).toBe(1350);
  });

  it('tells the vendor about a new order with the items total, not the delivery-inclusive one', async () => {
    const { vendor } = await deliveryOrder({ booked: false });
    const note = await Notification.findOne({ user: vendor.user._id, type: 'new_order' }).lean();
    expect(note.metadata.orderTotal).toBe(3000);
  });
});

describe('revenue counts items, not delivery', () => {
  async function completed() {
    const ctx = await deliveryOrder();
    await Order.updateOne({ _id: ctx.order._id }, { $set: { status: 'completed' } });
    return ctx;
  }

  it('gives the vendor item sales as revenue', async () => {
    const { vendor } = await completed();
    const res = await get('/api/v1/analytics/business/overview', vendor.token);
    expect(res.status).toBe(200);
    expect(res.body.revenue).toBe(3000);
  });

  it('gives the admin item sales and ChopNow fees as revenue, and delivery on its own', async () => {
    const { admin } = await completed();
    const res = await get('/api/v1/analytics/admin/stats', admin.token);
    expect(res.status).toBe(200);
    expect(res.body.revenue.total).toBe(3000);
    expect(res.body.revenue.platformFees).toBe(300);
    expect(res.body.delivery.collected).toBe(1500);
    expect(res.body.delivery.booked).toMatchObject({
      orders: 1,
      collected: 1500,
      courierCharged: 1350,
      difference: 150,
    });
  });
});

describe('the admin deliveries table and the courier statement', () => {
  it('lists each delivery with what the customer paid and what the courier charged', async () => {
    const { admin, order } = await deliveryOrder();
    const res = await get('/api/v1/analytics/admin/deliveries', admin.token);
    expect(res.status).toBe(200);
    expect(res.body.summary.booked.difference).toBe(150);
    const row = res.body.deliveries.find((d) => d.orderNumber === order.orderNumber);
    expect(row).toMatchObject({
      courierReference: 'MM-1010-A01',
      customerPaid: 1500,
      courierQuoted: 1400,
      courierCharged: 1350,
      difference: 150,
      shop: 'Kigali Bakery',
    });
  });

  it('is for admins only', async () => {
    const { vendor, customer } = await deliveryOrder();
    for (const token of [vendor.token, customer.token]) {
      expect((await get('/api/v1/analytics/admin/deliveries', token)).status).toBe(403);
      expect((await get('/api/v1/analytics/admin/deliveries.csv', token)).status).toBe(403);
    }
    expect((await request(app).get('/api/v1/analytics/admin/deliveries.csv')).status).toBe(401);
  });

  it("gives the courier a CSV with what they charged and none of ChopNow's own figures", async () => {
    const { admin, order } = await deliveryOrder();
    const res = await get('/api/v1/analytics/admin/deliveries.csv?for=courier', admin.token);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain(order.orderNumber);
    expect(res.text).toContain('MM-1010-A01');
    expect(res.text).toContain('1350');
    expect(res.text).not.toMatch(/Customer paid|Difference/);
    expect(res.text).not.toContain('1500');
  });

  it('gives the admin the full CSV, and keeps spreadsheet formulas from running', async () => {
    const { admin, vendor, order } = await deliveryOrder();
    await Order.updateOne(
      { _id: order._id },
      { $set: { 'deliveryDetails.address.street': '=HYPERLINK("http://evil")' } }
    );
    const res = await get('/api/v1/analytics/admin/deliveries.csv', admin.token);
    expect(res.text).toMatch(/Customer paid for delivery/);
    expect(res.text).toMatch(/Difference/);
    expect(res.text).toContain("'=HYPERLINK");
    expect(res.text).toContain(vendor.business.name);
  });
});

describe('an order with a courier booking', () => {
  it('cannot be cancelled by the customer, the vendor or an admin', async () => {
    const { vendor, customer, admin, order } = await deliveryOrder();
    for (const token of [customer.token, vendor.token, admin.token]) {
      const res = await request(app)
        .put(`/api/v1/orders/${order._id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'changed my mind' });
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('COURIER_BOOKED');
    }
    expect((await Order.findById(order._id)).status).toBe('out_for_delivery');
  });

  it('can still be cancelled while no rider is booked', async () => {
    const { customer, order } = await deliveryOrder({ booked: false });
    const res = await request(app)
      .put(`/api/v1/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${customer.token}`)
      .send({});
    expect(res.status).toBe(200);
    expect((await Order.findById(order._id)).status).toBe('cancelled');
  });
});

describe('who confirms a courier delivery', () => {
  const complete = (token, id) =>
    request(app)
      .put(`/api/v1/orders/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

  it('is ChopNow: the shop cannot complete an order a courier rider is carrying', async () => {
    const { vendor, order } = await deliveryOrder();
    const res = await complete(vendor.token, order._id);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ADMIN_CONFIRMS_DELIVERY');
    expect((await Order.findById(order._id)).status).toBe('out_for_delivery');
  });

  it('lets an admin complete it, and credits the vendor their share', async () => {
    const { vendor, admin, order } = await deliveryOrder();
    const res = await complete(admin.token, order._id);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    const Business = require('../models/Business');
    const shop = await Business.findById(vendor.business._id).lean();
    expect(shop.stats.balance).toBe(2700);
  });

  it('still lets a shop complete its own delivery when no courier is involved', async () => {
    const { vendor, order } = await deliveryOrder({ booked: false });
    await Order.updateOne({ _id: order._id }, { $set: { status: 'out_for_delivery' } });
    const res = await complete(vendor.token, order._id);
    expect(res.status).toBe(200);
  });
});

describe('the courier details a customer sees', () => {
  it('include the booking reference but not what ChopNow pays the courier', async () => {
    const { customer, order } = await deliveryOrder();
    const res = await get(`/api/v1/orders/${order._id}`, customer.token);
    expect(res.body.courier.bookingReference).toBe('MM-1010-A01');
    expect(res.body.courier.bookedRwf).toBeUndefined();
    expect(res.body.courier.quotedRwf).toBeUndefined();
    const list = await get('/api/v1/orders', customer.token);
    const row = list.body.orders.find((o) => o._id === order._id);
    expect(row.courier.bookingReference).toBe('MM-1010-A01');
    expect(row.courier.bookedRwf).toBeUndefined();
  });

  it('can find the delivery help line in the public settings', async () => {
    const res = await request(app).get('/api/v1/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.courierHelpPhone).toBe('+250 781 727 394');
  });
});

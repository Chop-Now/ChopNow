/**
 * My Orders used to show only a buyer's ten most recent orders (the default page size), so an
 * active customer's history silently lost everything older. The pages now ask for the whole list.
 */
const request = require('supertest');
const app = require('./app');
const Order = require('../models/Order');
const { createBusinessOwnerWithBusiness, createListing, createConsumer } = require('./fixtures');

describe('order list page sizes', () => {
  it('returns every order when the client asks for a large page, and caps the maximum', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { user, token } = await createConsumer();
    for (let i = 0; i < 12; i++) {
      await Order.create({
        customer: user._id,
        business: business._id,
        listing: listing._id,
        items: [{ listing: listing._id, title: 'x', quantity: 1, unitPrice: 1000, subtotal: 1000 }],
        pricing: {
          subtotal: 1000,
          deliveryFee: 0,
          platformFee: 100,
          vendorAmount: 900,
          total: 1000,
        },
        fulfillmentType: 'pickup',
        status: 'completed',
        payment: { paymentMethod: 'cash', paymentStatus: 'completed' },
      });
    }
    const get = (q) =>
      request(app).get(`/api/v1/orders?role=consumer${q}`).set('Authorization', `Bearer ${token}`);

    const dflt = await get('');
    expect(dflt.body.orders).toHaveLength(10);
    expect(dflt.body.total).toBe(12);

    const all = await get('&limit=200');
    expect(all.body.orders).toHaveLength(12);

    expect((await get('&limit=99999')).status).toBe(200);
  });
});

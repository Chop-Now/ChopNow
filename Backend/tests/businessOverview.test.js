/**
 * Phase 7 regression - GET /api/v1/analytics/business/overview must return
 * real revenue computed from the business's completed orders. It previously
 * computed `completedRevenue` internally but never included it in the JSON
 * response, so the vendor dashboard always showed "Total Revenue: RWF 0"
 * even right after a completed order (found during live checkout testing,
 * see the Fix Checklist's Phase 7).
 */
const request = require('supertest');
const app = require('./app');
const Order = require('../models/Order');
const { createBusinessOwnerWithBusiness, createConsumer, createListing } = require('./fixtures');

describe('GET /api/v1/analytics/business/overview (Phase 7)', () => {
  it('returns real revenue summed from completed orders, not zero', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { user: customer } = await createConsumer();

    await Order.create({
      customer: customer._id,
      business: business._id,
      listing: listing._id,
      items: [
        {
          listing: listing._id,
          title: listing.title,
          quantity: 1,
          unitPrice: 5000,
          subtotal: 5000,
        },
      ],
      pricing: { subtotal: 5000, deliveryFee: 0, platformFee: 500, vendorAmount: 4500, total: 5000 },
      fulfillmentType: 'pickup',
      status: 'completed',
      payment: { paymentMethod: 'cash', paymentStatus: 'completed' },
    });

    const res = await request(app)
      .get('/api/v1/analytics/business/overview')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.revenue).toBe(5000);
  });

  it('returns 0 revenue (not undefined) when there are no completed orders', async () => {
    const { token } = await createBusinessOwnerWithBusiness();

    const res = await request(app)
      .get('/api/v1/analytics/business/overview')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.revenue).toBe(0);
  });
});

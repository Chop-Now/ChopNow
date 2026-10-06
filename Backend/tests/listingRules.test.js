/**
 * A listing is a discount: nobody can list a deal above its original price, with a
 * negative price, or a pickup window that ends before it starts - on create or edit.
 * (Found in the full-platform pass: a vendor could publish "price 2000, original 1000".)
 */
const request = require('supertest');
const app = require('./app');
const Listing = require('../models/Listing');
const {
  createBusinessOwnerWithBusiness,
  createListing,
  createAdmin,
  createConsumer,
} = require('./fixtures');

const now = Date.now();
const body = (business, over = {}) => ({
  title: 'Day-old bread',
  description: 'Bread from today, perfectly good to eat.',
  business: String(business._id),
  category: 'baked-goods',
  pricing: { price: 1000, originalPrice: 2000, currency: 'RWF' },
  inventory: { quantity: 5 },
  timeWindow: {
    availableFrom: new Date(now - 3600e3).toISOString(),
    availableUntil: new Date(now + 7200e3).toISOString(),
  },
  fulfillment: 'pickup',
  ...over,
});
const post = (token, b) =>
  request(app).post('/api/v1/listings').set('Authorization', `Bearer ${token}`).send(b);

describe('listing price and window rules', () => {
  it('accepts a normal discount', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const res = await post(token, body(business));
    expect(res.status).toBe(201);
  });

  it('accepts a listing with no original price, and one priced equal to it', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    expect((await post(token, body(business, { pricing: { price: 1000 } }))).status).toBe(201);
    expect(
      (await post(token, body(business, { pricing: { price: 1500, originalPrice: 1500 } }))).status
    ).toBe(201);
  });

  it('rejects a deal price above the original price', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const res = await post(
      token,
      body(business, { pricing: { price: 2000, originalPrice: 1000 } })
    );
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/higher than the original/i);
    expect(await Listing.countDocuments({})).toBe(0);
  });

  it('rejects a negative price', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const res = await post(token, body(business, { pricing: { price: -5 } }));
    expect(res.status).toBe(400);
  });

  it('rejects editing a listing into an invalid price, and keeps the old one', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business, {
      pricing: { price: 1000, originalPrice: 2000 },
    });
    const res = await request(app)
      .put(`/api/v1/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ pricing: { price: 5000, originalPrice: 2000 } });
    expect(res.status).toBe(400);
    expect((await Listing.findById(listing._id)).pricing.price).toBe(1000);
  });

  it('lets the vendor edit a valid price, and an admin too', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business, {
      pricing: { price: 1000, originalPrice: 2000 },
    });
    const ok = await request(app)
      .put(`/api/v1/listings/${listing._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ pricing: { price: 800, originalPrice: 2000 } });
    expect(ok.status).toBe(200);
    const { token: adminToken } = await createAdmin();
    const asAdmin = await request(app)
      .put(`/api/v1/listings/${listing._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ pricing: { price: 700, originalPrice: 2000 } });
    expect(asAdmin.status).toBe(200);
    expect((await Listing.findById(listing._id)).pricing.price).toBe(700);
  });

  it("another vendor and a plain buyer cannot edit someone else's listing", async () => {
    const owner = await createBusinessOwnerWithBusiness();
    const other = await createBusinessOwnerWithBusiness();
    const buyer = await createConsumer();
    const listing = await createListing(owner.business);
    for (const token of [other.token, buyer.token]) {
      const res = await request(app)
        .put(`/api/v1/listings/${listing._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hijacked' });
      expect([401, 403]).toContain(res.status);
    }
    expect((await Listing.findById(listing._id)).title).toBe('Test Listing');
  });

  it('rejects a pickup window that ends before it starts', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const res = await post(
      token,
      body(business, {
        timeWindow: {
          availableFrom: new Date(now + 7200e3).toISOString(),
          availableUntil: new Date(now + 3600e3).toISOString(),
        },
      })
    );
    expect(res.status).toBe(400);
  });
});

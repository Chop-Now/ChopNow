/**
 * Pre-launch audit fixes: each test pins down a bug found by exercising the live API.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./app');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Business = require('../models/Business');
const { ensureFavoriteIndexes } = require('../config/database');
const {
  createConsumer,
  createBusinessOwnerWithBusiness,
  createListing,
  createAdmin,
  placePaidOrder,
} = require('./fixtures');

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

describe('public business endpoints', () => {
  it('never expose payout details, KYC documents or the owner contact details', async () => {
    const { business } = await createBusinessOwnerWithBusiness({
      payoutInfo: { preferredMethod: 'bank', bankName: 'BK', accountNumber: '0001234567890' },
      verification: { status: 'verified', documents: [{ type: 'id_card', url: 'https://x/id' }] },
    });

    const list = await request(app).get('/api/v1/businesses?status=all&limit=100');
    const one = await request(app).get(`/api/v1/businesses/${business._id}`);

    for (const shop of [list.body.businesses[0], one.body]) {
      expect(shop.payoutInfo).toBeUndefined();
      expect(shop.verification).toEqual({ status: 'verified' });
      expect(shop.owner.email).toBeUndefined();
      expect(shop.owner.phone).toBeUndefined();
    }
  });

  it('show inactive shops only to admins', async () => {
    const { business } = await createBusinessOwnerWithBusiness({ status: 'suspended' });
    const { token: adminToken } = await createAdmin();

    const publicList = await request(app).get('/api/v1/businesses?status=all');
    expect(publicList.body.businesses).toHaveLength(0);
    const publicOne = await request(app).get(`/api/v1/businesses/${business._id}`);
    expect(publicOne.status).toBe(404);

    const adminList = await request(app)
      .get('/api/v1/businesses?status=all')
      .set(bearer(adminToken));
    expect(adminList.body.businesses).toHaveLength(1);
    expect(adminList.body.businesses[0].owner.email).toBeDefined();
  });

  it('filters by location without failing', async () => {
    await createBusinessOwnerWithBusiness({
      location: { type: 'Point', coordinates: [30.06, -1.94] },
    });
    const res = await request(app).get('/api/v1/businesses?lat=-1.94&lng=30.06&radius=5000');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);

    const bad = await request(app).get('/api/v1/businesses?lat=abc&lng=30');
    expect(bad.status).toBe(400);
  });
});

describe('order privacy', () => {
  it('lets only the owner of the shop that received an order read it', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const { token: otherVendorToken } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { token: customerToken } = await createConsumer();
    const { order } = await placePaidOrder(customerToken, listing);

    const res = await request(app).get(`/api/v1/orders/${order._id}`).set(bearer(otherVendorToken));
    expect(res.status).toBe(403);
  });
});

describe('riders', () => {
  it('cannot take deliveries until an admin approves them', async () => {
    const { token } = await createConsumer();
    const added = await request(app)
      .post('/api/v1/users/add-role')
      .set(bearer(token))
      .send({ role: 'rider', switchToNew: true });
    expect(added.status).toBe(200);

    const res = await request(app).get('/api/v1/deliveries/available').set(bearer(token));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('RIDER_NOT_APPROVED');
  });
});

describe('favourites', () => {
  beforeAll(async () => {
    // Older databases carry sparse unique indexes that allowed only one favourite each
    const favorites = mongoose.connection.collection('favorites');
    await favorites.insertOne({ _probe: true }).catch(() => {});
    await favorites.deleteMany({ _probe: true });
    await favorites.dropIndexes().catch(() => {});
    await favorites.createIndex({ user: 1, business: 1 }, { unique: true, sparse: true });
    await ensureFavoriteIndexes();
  });

  it('a customer can save several listings and several shops', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const { business: otherShop } = await createBusinessOwnerWithBusiness();
    const listings = await Promise.all([createListing(business), createListing(business)]);
    const { token } = await createConsumer();

    const saves = [
      ...listings.map((l) => ({ favoriteType: 'listing', referenceId: String(l._id) })),
      { favoriteType: 'business', referenceId: String(business._id) },
      { favoriteType: 'business', referenceId: String(otherShop._id) },
    ];
    for (const body of saves) {
      const res = await request(app).post('/api/v1/favorites/toggle').set(bearer(token)).send(body);
      expect(res.status).toBe(200);
      expect(res.body.isFavorite).toBe(true);
    }

    const list = await request(app).get('/api/v1/favorites').set(bearer(token));
    expect(list.body.total).toBe(4);
  });
});

describe('listing edits', () => {
  it('keep the fields the form did not send, and restocking puts a sold-out listing back on sale', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business, {
      pricing: { price: 5000, originalPrice: 9000, currency: 'RWF' },
      inventory: { quantity: 0, reserved: 2, unit: 'item' },
      status: 'sold_out',
    });

    const res = await request(app)
      .put(`/api/v1/listings/${listing._id}`)
      .set(bearer(token))
      .send({ pricing: { price: 4000 }, inventory: { quantity: 5, reserved: 0 } });
    expect(res.status).toBe(200);

    const saved = await Listing.findById(listing._id).lean();
    expect(saved.pricing).toMatchObject({ price: 4000, originalPrice: 9000, currency: 'RWF' });
    expect(saved.inventory).toMatchObject({ quantity: 5, reserved: 2, unit: 'item' });
    expect(saved.status).toBe('active');
  });
});

describe('deleting a shop', () => {
  it('is refused while it has a paid order in progress', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { token: customerToken } = await createConsumer();
    await placePaidOrder(customerToken, listing);

    const res = await request(app).delete(`/api/v1/businesses/${business._id}`).set(bearer(token));
    expect(res.status).toBe(409);
  });
});

describe('cart', () => {
  it('cannot hold more of a listing than is in stock', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business, { inventory: { quantity: 10 } });
    const { token } = await createConsumer();
    const add = (quantity) =>
      request(app)
        .post('/api/v1/cart/add')
        .set(bearer(token))
        .send({ listingId: String(listing._id), quantity });

    expect((await add(8)).status).toBe(200);
    expect((await add(8)).status).toBe(400);
  });
});

describe('emailed codes', () => {
  it('are voided after five wrong guesses, including via address variants', async () => {
    const { user } = await createConsumer({ email: 'codevictim@example.com' });
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: '123456',
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post('/api/v1/users/verify-reset-otp')
        .send({ email: 'codevictim@example.com', otp: String(200000 + i) });
    }

    const right = await request(app)
      .post('/api/v1/users/verify-reset-otp')
      .send({ email: 'codevictim@example.com', otp: '123456' });
    expect(right.status).toBe(400);
  });

  it('reset-password requires the account email', async () => {
    const res = await request(app)
      .post('/api/v1/users/reset-password')
      .send({ token: '123456', password: 'NewPassword1' });
    expect(res.status).toBe(400);
  });
});

describe('requests without a body', () => {
  it('get a 4xx, not a 500', async () => {
    const { token } = await createConsumer();
    const res = await request(app).post('/api/v1/favorites/toggle').set(bearer(token));
    expect(res.status).toBe(400);
  });
});

describe('unverified accounts (while email verification is required)', () => {
  it('can sign up and browse but cannot order until the email is verified', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const reg = await request(app).post('/api/v1/users/register').send({
      email: 'notverified@example.com',
      password: 'Password1',
      firstName: 'Not',
      lastName: 'Verified',
    });
    expect(reg.status).toBe(201);

    const res = await request(app)
      .post('/api/v1/orders/checkout')
      .set(bearer(reg.body.token))
      .send({ items: [{ listing: String(listing._id), quantity: 1 }], fulfillmentType: 'pickup' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('EMAIL_VERIFICATION_REQUIRED');
  });
});

describe('login replies', () => {
  it('do not reveal whether an email is registered', async () => {
    await createConsumer({ email: 'known@example.com' });
    const known = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'known@example.com', password: 'WrongPassword1' });
    const unknown = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'nobody@example.com', password: 'WrongPassword1' });
    expect(known.status).toBe(401);
    expect(unknown.body).toEqual(known.body);

    const otpUnknown = await request(app)
      .post('/api/v1/users/send-otp')
      .send({ email: 'nobody@example.com' });
    expect(otpUnknown.status).toBe(200);
  });
});

describe('payout details', () => {
  it('need a confirmed emailed code to change, and a masked number sent back keeps the real one', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness({
      payoutInfo: { preferredMethod: 'bank', bankName: 'BK', accountNumber: '0001234567890' },
    });
    const put = (payoutInfo) =>
      request(app)
        .put(`/api/v1/businesses/${business._id}`)
        .set(bearer(token))
        .send({ payoutInfo });

    const blocked = await put({
      preferredMethod: 'bank',
      bankName: 'BK',
      accountNumber: '9999999999',
    });
    expect(blocked.status).toBe(403);
    expect(blocked.body.code).toBe('PAYOUT_CHANGE_NEEDS_CODE');

    // Re-saving the form unchanged (masked number echoed back) needs no code and changes nothing
    const unchanged = await put({
      preferredMethod: 'bank',
      bankName: 'BK',
      accountNumber: '****7890',
    });
    expect(unchanged.status).toBe(200);

    const owner = await User.findById(business.owner);
    await User.updateOne(
      { _id: owner._id },
      { otpCode: '654321', otpExpires: new Date(Date.now() + 60 * 1000) }
    );
    const verified = await request(app)
      .post('/api/v1/users/verify-sensitive-change-otp')
      .set(bearer(token))
      .send({ otp: '654321' });
    expect(verified.status).toBe(200);
    expect((await put({ accountNumber: '9999999999' })).status).toBe(200);
    // One code, one change
    expect((await put({ accountNumber: '8888888888' })).status).toBe(403);

    const saved = await Business.findById(business._id).lean();
    expect(saved.payoutInfo.accountNumber).toBe('9999999999');
  });
});

describe('vendor order steps', () => {
  it('cannot complete a pickup order without the customer code', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { token: customerToken } = await createConsumer();
    const { order } = await placePaidOrder(customerToken, listing);

    const res = await request(app)
      .put(`/api/v1/orders/${order._id}/status`)
      .set(bearer(token))
      .send({ status: 'completed' });
    expect(res.status).toBe(400);

    const ready = await request(app)
      .put(`/api/v1/orders/${order._id}/status`)
      .set(bearer(token))
      .send({ status: 'ready_for_pickup' });
    expect(ready.status).toBe(200);
    const back = await request(app)
      .put(`/api/v1/orders/${order._id}/status`)
      .set(bearer(token))
      .send({ status: 'confirmed' });
    expect(back.status).toBe(400);
  });
});

describe('rate-limit client IP', () => {
  const { clientIp } = require('../utils/clientIp');
  const fakeReq = (headers, ip = '10.0.0.1') => ({
    ip,
    get: (name) => headers[name.toLowerCase()],
  });

  it("uses the visitor address Cloudflare passes on, not the proxy's", () => {
    expect(clientIp(fakeReq({ 'cf-connecting-ip': '41.186.1.2' }))).toBe('41.186.1.2');
  });

  it('uses the visitor Vercel reports when the request came through the /api rewrite', () => {
    const viaVercel = {
      'x-vercel-id': 'cdg1::abc',
      'x-forwarded-for': '41.186.9.9, 76.76.21.21',
      'cf-connecting-ip': '76.76.21.21',
    };
    expect(clientIp(fakeReq(viaVercel))).toBe('41.186.9.9');
    expect(clientIp(fakeReq({ ...viaVercel, 'x-vercel-forwarded-for': '41.186.7.7' }))).toBe(
      '41.186.7.7'
    );
  });

  it('falls back to req.ip when the header is missing or not an IP', () => {
    expect(clientIp(fakeReq({}))).toBe('10.0.0.1');
    expect(clientIp(fakeReq({ 'cf-connecting-ip': 'nonsense' }))).toBe('10.0.0.1');
  });
});

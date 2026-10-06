/**
 * Malformed input is the caller's mistake (4xx), never a 500 with a raw
 * Mongoose / TypeError message.
 */
const request = require('supertest');
const app = require('./app');
const { createConsumer, createBusinessOwnerWithBusiness, createListing } = require('./fixtures');

describe('input hardening', () => {
  it('rejects a malformed id in the URL with 400', async () => {
    const { token } = await createConsumer();
    const res = await request(app)
      .get('/api/v1/orders/not-an-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('rejects a non-string email on login with 400', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: ['a@b.co'], password: 'x' });
    expect(res.status).toBe(400);
  });

  describe('cart quantities', () => {
    let token;
    let listingId;
    beforeEach(async () => {
      ({ token } = await createConsumer());
      const { business } = await createBusinessOwnerWithBusiness();
      const listing = await createListing(business);
      listingId = String(listing._id);
    });
    const add = (body) =>
      request(app).post('/api/v1/cart/add').set('Authorization', `Bearer ${token}`).send(body);

    it.each([-5, 0, 1.5, '3', null])('refuses quantity %p with 400', async (quantity) => {
      expect((await add({ listingId, quantity })).status).toBe(400);
    });

    it('refuses a malformed listing id with 400', async () => {
      expect((await add({ listingId: 'nope', quantity: 1 })).status).toBe(400);
    });

    it('accepts a normal quantity', async () => {
      expect((await add({ listingId, quantity: 2 })).status).toBe(200);
    });

    it('refuses a fractional quantity on update', async () => {
      const res = await request(app)
        .put('/api/v1/cart/update')
        .set('Authorization', `Bearer ${token}`)
        .send({ listingId, quantity: 2.5 });
      expect(res.status).toBe(400);
    });
  });
});

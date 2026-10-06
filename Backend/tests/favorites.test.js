/**
 * The heart button needs to know whether an item is saved after toggling and
 * after a page reload. The API answered with different field names than the web
 * app read, so the heart never filled and a reload forgot saved items.
 */
const request = require('supertest');
const app = require('./app');
const { createConsumer, createBusinessOwnerWithBusiness, createListing } = require('./fixtures');

describe('favourites', () => {
  it('toggle reports where the item ended up, check reports saved state, list returns it', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { token } = await createConsumer();
    const auth = { Authorization: `Bearer ${token}` };

    const added = await request(app)
      .post('/api/v1/favorites/toggle')
      .set(auth)
      .send({ favoriteType: 'listing', referenceId: String(listing._id) });
    expect(added.status).toBe(200);
    expect(added.body).toMatchObject({ action: 'added', isFavorite: true });

    const check = await request(app)
      .get(`/api/v1/favorites/check/listing/${listing._id}`)
      .set(auth);
    expect(check.body).toMatchObject({ isFavorited: true, isFavorite: true });

    const list = await request(app).get('/api/v1/favorites?favoriteType=listing').set(auth);
    expect(list.body.favorites).toHaveLength(1);
    expect(String(list.body.favorites[0].listing._id)).toBe(String(listing._id));

    const removed = await request(app)
      .post('/api/v1/favorites/toggle')
      .set(auth)
      .send({ favoriteType: 'listing', referenceId: String(listing._id) });
    expect(removed.body).toMatchObject({ action: 'removed', isFavorite: false });
    const after = await request(app)
      .get(`/api/v1/favorites/check/listing/${listing._id}`)
      .set(auth);
    expect(after.body.isFavorite).toBe(false);
  });

  it("one buyer's saved items are not visible to another", async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const a = await createConsumer();
    const b = await createConsumer();
    await request(app)
      .post('/api/v1/favorites/toggle')
      .set({ Authorization: `Bearer ${a.token}` })
      .send({ favoriteType: 'listing', referenceId: String(listing._id) });
    const list = await request(app)
      .get('/api/v1/favorites')
      .set({ Authorization: `Bearer ${b.token}` });
    expect(list.body.favorites).toHaveLength(0);
  });
});

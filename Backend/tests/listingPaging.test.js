/**
 * The shop, the vendor's listings page and the admin's listings page all read the full
 * list, so the API has to let them ask for more than the default 20 (it used to be
 * impossible to see a vendor's 21st listing, or the 21st deal in the shop).
 */
const request = require('supertest');
const app = require('./app');
const { createBusinessOwnerWithBusiness, createListing } = require('./fixtures');

describe('listing page sizes', () => {
  it('returns more than 20 listings when asked, and caps absurd page sizes', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    for (let i = 0; i < 23; i++) await createListing(business, { title: `Deal ${i}` });

    const dflt = await request(app).get('/api/v1/listings?status=active');
    expect(dflt.body.listings).toHaveLength(20);
    expect(dflt.body.total).toBe(23);

    const big = await request(app).get('/api/v1/listings?status=active&limit=200');
    expect(big.body.listings).toHaveLength(23);

    const byBusiness = await request(app).get(
      `/api/v1/listings/business/${business._id}?limit=500`
    );
    expect(byBusiness.body.listings).toHaveLength(23);

    const capped = await request(app).get('/api/v1/listings?status=active&limit=99999');
    expect(capped.status).toBe(200);
    expect(capped.body.listings.length).toBeLessThanOrEqual(500);
  });
});

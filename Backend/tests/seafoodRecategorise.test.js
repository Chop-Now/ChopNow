/**
 * Moving fish listings out of the old "meat" category (one-off clean-up).
 * Only titles decide; ambiguous ones are reported, never changed.
 */
const request = require('supertest');
const app = require('./app');
const Listing = require('../models/Listing');
const { classifyListing, recategoriseSeafood } = require('../services/seafoodRecategoriser');
const {
  createAdmin,
  createBusinessOwnerWithBusiness,
  createConsumer,
  createListing,
} = require('./fixtures');

describe('classifyListing', () => {
  it.each([
    ['Fresh Tilapia 1kg', 'move'],
    ['Grilled salmon fillet', 'move'],
    ['Isambaza (small fried fish)', 'move'],
    ['Prawns & calamari box', 'move'],
    ['Nile perch', 'move'],
    ['Tuna steak', 'review'], // names fish and "steak"
    ['Chicken and fish combo', 'review'],
    ['Chicken Wings', 'leave'],
    ['Goat brochettes', 'leave'],
    ['Cod liver oil sausages', 'review'],
    ['Codfish cakes', 'leave'], // "codfish" is not the whole word "cod"
  ])('%s -> %s', (title, expected) => {
    expect(classifyListing({ title })).toBe(expected);
  });

  it('flags a fish word only in the description for review, never moves it', () => {
    expect(
      classifyListing({ title: 'Family platter', description: 'Served with grilled fish.' })
    ).toBe('review');
  });

  it('does not match inside other words', () => {
    expect(classifyListing({ title: 'Scodded beef' })).toBe('leave');
    expect(classifyListing({ title: 'Fishermans pie', description: '' })).toBe('leave');
  });

  it('copes with missing fields', () => {
    expect(classifyListing({})).toBe('leave');
    expect(classifyListing({ title: null, description: null })).toBe('leave');
  });
});

describe('recategoriseSeafood', () => {
  async function seed() {
    const { business } = await createBusinessOwnerWithBusiness();
    const make = (title, category = 'meat', extra = {}) =>
      createListing(business, { title, category, ...extra });
    return {
      tilapia: await make('Fresh Tilapia'),
      combo: await make('Chicken and fish combo'),
      chicken: await make('Roast Chicken'),
      mealFish: await make('Fish and chips', 'meals'),
      desc: await make('Family platter', 'meat', { description: 'Served with grilled fish.' }),
    };
  }

  it('previews without changing anything by default', async () => {
    const { tilapia } = await seed();
    const result = await recategoriseSeafood();
    expect(result.applied).toBe(false);
    expect(result.moved.map((l) => l.title)).toEqual(['Fresh Tilapia']);
    expect((await Listing.findById(tilapia._id)).category).toBe('meat');
  });

  it('moves only the clear fish listings in the meat category when applied', async () => {
    const s = await seed();
    const result = await recategoriseSeafood({ apply: true });

    expect(result.moved.map((l) => l.title)).toEqual(['Fresh Tilapia']);
    expect(result.review.map((l) => l.title).sort()).toEqual([
      'Chicken and fish combo',
      'Family platter',
    ]);
    expect((await Listing.findById(s.tilapia._id)).category).toBe('seafood');
    expect((await Listing.findById(s.combo._id)).category).toBe('meat');
    expect((await Listing.findById(s.desc._id)).category).toBe('meat');
    expect((await Listing.findById(s.chicken._id)).category).toBe('meat');
    // Not in the meat category, so never touched
    expect((await Listing.findById(s.mealFish._id)).category).toBe('meals');
  });

  it('is safe to run again', async () => {
    await seed();
    await recategoriseSeafood({ apply: true });
    const again = await recategoriseSeafood({ apply: true });
    expect(again.moved).toEqual([]);
  });
});

describe('POST /api/v1/listings/admin/recategorise-seafood', () => {
  const call = (token, body) =>
    request(app)
      .post('/api/v1/listings/admin/recategorise-seafood')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  it('is admin only', async () => {
    const { token: vendorToken } = await createBusinessOwnerWithBusiness();
    const { token: consumerToken } = await createConsumer();
    expect((await call(vendorToken, {})).status).toBe(403);
    expect((await call(consumerToken, {})).status).toBe(403);
    expect(
      (await request(app).post('/api/v1/listings/admin/recategorise-seafood').send({})).status
    ).toBe(401);
  });

  it('only previews unless apply is exactly true', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const fish = await createListing(business, { title: 'Fresh Tilapia', category: 'meat' });
    const { token } = await createAdmin();

    for (const body of [{}, { apply: false }, { apply: 'true' }, { apply: 1 }]) {
      const res = await call(token, body);
      expect(res.status).toBe(200);
      expect(res.body.applied).toBe(false);
      expect(res.body.moved.map((l) => l.title)).toEqual(['Fresh Tilapia']);
    }
    expect((await Listing.findById(fish._id)).category).toBe('meat');
  });

  it('moves the clear fish listings when applied', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const fish = await createListing(business, { title: 'Fresh Tilapia', category: 'meat' });
    const combo = await createListing(business, {
      title: 'Chicken and fish combo',
      category: 'meat',
    });
    const { token } = await createAdmin();

    const res = await call(token, { apply: true });
    expect(res.status).toBe(200);
    expect(res.body.applied).toBe(true);
    expect(res.body.moved).toHaveLength(1);
    expect(res.body.review).toHaveLength(1);
    expect((await Listing.findById(fish._id)).category).toBe('seafood');
    expect((await Listing.findById(combo._id)).category).toBe('meat');
  });
});

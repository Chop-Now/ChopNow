/**
 * The admin Users page is paged, so searching must happen on the server: a user who is not on
 * the ten rows on screen has to be findable, and the summary cards must count everyone.
 */
const request = require('supertest');
const app = require('./app');
const User = require('../models/User');
const { createAdmin, createConsumer, createBusinessOwnerWithBusiness } = require('./fixtures');

const list = (token, query = '') =>
  request(app).get(`/api/v1/users?limit=5${query}`).set('Authorization', `Bearer ${token}`);

describe('GET /api/v1/users (admin)', () => {
  it('finds a user by name or email even when they are not on the first page', async () => {
    const admin = await createAdmin();
    for (let i = 0; i < 8; i++) await createConsumer();
    const { user } = await createConsumer({ email: 'needle.person@example.org' });
    await User.updateOne({ _id: user._id }, { firstName: 'Ngabo', lastName: 'Needle' });

    const byEmail = await list(admin.token, '&search=needle.person');
    expect(byEmail.body.users.map((u) => u.email)).toEqual(['needle.person@example.org']);
    expect(byEmail.body.total).toBe(1);

    const byName = await list(admin.token, '&search=ngabo');
    expect(byName.body.users).toHaveLength(1);
  });

  it('treats the search text literally (no regex injection)', async () => {
    const admin = await createAdmin();
    const res = await list(admin.token, '&search=' + encodeURIComponent('.*'));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it('reports platform-wide vendor and rider counts, not just the page', async () => {
    const admin = await createAdmin();
    await createBusinessOwnerWithBusiness();
    await createBusinessOwnerWithBusiness();
    const res = await list(admin.token);
    expect(res.body.counts.activeVendors).toBe(2);
    expect(res.body.counts.activeRiders).toBe(0);
  });
});

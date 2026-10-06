/**
 * An admin editing a user can lock the platform out of its own admin panel, or sneak
 * past the "cannot suspend an admin" rule through the general update endpoint.
 */
const request = require('supertest');
const app = require('./app');
const User = require('../models/User');
const { createAdmin, createConsumer } = require('./fixtures');

const put = (token, id, body) =>
  request(app).put(`/api/v1/users/${id}`).set('Authorization', `Bearer ${token}`).send(body);

describe('PUT /api/v1/users/:id (admin)', () => {
  it('will not remove the admin role from the last admin', async () => {
    await User.deleteMany({ roles: 'admin' });
    const admin = await createAdmin();
    const res = await put(admin.token, admin.user._id, { roles: ['consumer'] });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/last admin/i);
    expect((await User.findById(admin.user._id)).roles).toContain('admin');
  });

  it('allows it when another admin remains', async () => {
    const first = await createAdmin();
    const second = await createAdmin();
    const res = await put(first.token, second.user._id, { roles: ['consumer'] });
    expect(res.status).toBe(200);
    expect((await User.findById(second.user._id)).roles).not.toContain('admin');
  });

  it('will not suspend an admin through the general update', async () => {
    const admin = await createAdmin();
    const other = await createAdmin();
    const res = await put(admin.token, other.user._id, { status: 'suspended' });
    expect(res.status).toBe(403);
    expect((await User.findById(other.user._id)).status).toBe('active');
  });

  it('rejects a status that is not a real one, and still suspends an ordinary user', async () => {
    const admin = await createAdmin();
    const { user } = await createConsumer();
    expect((await put(admin.token, user._id, { status: 'banned' })).status).toBe(400);
    expect((await put(admin.token, user._id, { status: 'suspended' })).status).toBe(200);
    expect((await User.findById(user._id)).status).toBe('suspended');
  });
});

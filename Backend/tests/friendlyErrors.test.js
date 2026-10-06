/**
 * A phone number already on another account used to come back as HTTP 500 with a
 * raw MongoDB "E11000 duplicate key" string. It is the user's input, so it must be
 * a clear 409 the app can show.
 */
const request = require('supertest');
const app = require('./app');
const { friendlyDbError } = require('../utils/dbErrors');
const { createConsumer } = require('./fixtures');

const register = (body) =>
  request(app)
    .post('/api/v1/users/register')
    .send({ password: 'Password1', firstName: 'Amina', lastName: 'Uwase', ...body });

describe('friendlyDbError', () => {
  it('maps duplicate keys to a 409 naming the thing, without leaking internals', () => {
    const phone = friendlyDbError({ code: 11000, keyPattern: { phone: 1 }, message: 'E11000 ...' });
    expect(phone.status).toBe(409);
    expect(phone.message).toMatch(/phone number/i);
    expect(phone.message).not.toMatch(/E11000|index|dup/i);
    expect(friendlyDbError({ code: 11000, keyPattern: { email: 1 } }).message).toMatch(/email/i);
    expect(friendlyDbError({ code: 11000, keyPattern: { other: 1 } }).status).toBe(409);
  });

  it('maps validation errors to a 400 with the first message', () => {
    const r = friendlyDbError({ name: 'ValidationError', errors: { a: { message: 'Bad phone' } } });
    expect(r).toEqual({ status: 400, message: 'Bad phone' });
  });

  it('leaves everything else alone', () => {
    expect(friendlyDbError(new Error('boom'))).toBeNull();
    expect(friendlyDbError(null)).toBeNull();
  });
});

describe('duplicate phone numbers over HTTP', () => {
  it('registering with a phone another account has returns 409, not 500', async () => {
    const first = await register({ email: 'one@gmail.com', phone: '250788000111' });
    expect(first.status).toBe(201);
    const second = await register({ email: 'two@gmail.com', phone: '250788000111' });
    expect(second.status).toBe(409);
    expect(second.body.message).toMatch(/phone number/i);
  });

  it('changing your profile phone to one another account has returns 409', async () => {
    await register({ email: 'owner@gmail.com', phone: '250788000222' });
    const { token } = await createConsumer();
    const res = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '250788000222' });
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/phone number/i);
  });
});

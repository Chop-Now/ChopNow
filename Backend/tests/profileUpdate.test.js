/**
 * Accounts created without a phone number (the web form leaves it blank) must
 * still be able to save their name: an empty phone means "leave it alone".
 */
const request = require('supertest');
const app = require('./app');
const User = require('../models/User');
const { createConsumer } = require('./fixtures');

const update = (token, body) =>
  request(app).put('/api/v1/users/profile').set('Authorization', `Bearer ${token}`).send(body);

describe('PUT /api/v1/users/profile', () => {
  it('saves a new name when the phone is sent blank, and keeps the existing phone', async () => {
    const { token, user } = await createConsumer();
    await User.updateOne({ _id: user._id }, { phone: '+250788111222' });

    const res = await update(token, { firstName: 'Prudence', lastName: 'Mukamana', phone: '' });
    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Prudence');

    const saved = await User.findById(user._id);
    expect(saved.lastName).toBe('Mukamana');
    expect(saved.phone).toBe('+250788111222');
  });

  it('still rejects a phone number that is not a number', async () => {
    const { token } = await createConsumer();
    const res = await update(token, { phone: 'call me' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/valid phone/i);
  });
});

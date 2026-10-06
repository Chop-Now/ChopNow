/**
 * Payout details decide where money is sent. A vendor could save "abc" as their
 * mobile money number (found in the full-platform pass); now it is validated and
 * validated.
 */
const request = require('supertest');
const app = require('./app');
const Business = require('../models/Business');
const { normalizeRwandaMobile } = require('../utils/phone');
const { createBusinessOwnerWithBusiness } = require('./fixtures');

describe('normalizeRwandaMobile', () => {
  it.each([
    ['0788123456', '250788123456'],
    ['+250 788 123 456', '250788123456'],
    ['250788123456', '250788123456'],
    ['0788-123-456', '250788123456'],
    ['(0722) 123 456', '250722123456'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeRwandaMobile(input)).toBe(expected);
  });

  it.each([
    'abc',
    '',
    '12345',
    '0188123456',
    '07881234',
    '+250 0788 123 456',
    '250250788123456',
    null,
    42,
  ])('rejects %p', (input) => {
    expect(normalizeRwandaMobile(input)).toBeNull();
  });
});

describe('saving payout details', () => {
  const put = (token, id, payoutInfo) =>
    request(app)
      .put(`/api/v1/businesses/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ payoutInfo });

  it('rejects a junk mobile number and keeps the previous one', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const before = (await Business.findById(business._id)).payoutInfo.mobilePhone;
    const res = await put(token, business._id, { preferredMethod: 'mobile', mobilePhone: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid Rwandan mobile number/i);
    expect((await Business.findById(business._id)).payoutInfo.mobilePhone).toBe(before);
  });

  it('accepts a good number as written', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const res = await put(token, business._id, {
      preferredMethod: 'mobile',
      mobileProvider: 'Airtel',
      mobilePhone: '0733 123 456',
      mobileAccountName: 'Test Vendor',
    });
    expect(res.status).toBe(200);
    const saved = await Business.findById(business._id);
    expect(saved.payoutInfo.mobilePhone).toBe('0733 123 456');
    expect(saved.payoutInfo.mobileProvider).toBe('Airtel');
  });

  it('rejects a nonsense bank account number', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const res = await put(token, business._id, {
      preferredMethod: 'bank',
      bankName: 'BK',
      accountNumber: '12',
    });
    expect(res.status).toBe(400);
  });
});

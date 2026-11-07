/**
 * The public /vendors page has a short form ("Sign up as a vendor"). It must really email the
 * details to the founder's mailbox, and refuse junk.
 */
const request = require('supertest');
const app = require('./app');
const emailService = require('../utils/emailService');

const send = (body) => request(app).post('/api/v1/contact/vendor-interest').send(body);
const valid = {
  businessName: 'Kigali Bakery',
  contactName: 'Aline Uwimana',
  phone: '+250 788 123 456',
  email: 'aline@example.org',
  location: 'Kimironko, Kigali',
  foodType: 'Bread and pastries',
};

describe('POST /api/v1/contact/vendor-interest', () => {
  beforeEach(() => emailService.sendVendorInterest.mockClear());

  it('emails the details to the founder with the vendor as reply-to', async () => {
    const res = await send(valid);
    expect(res.status).toBe(202);
    expect(emailService.sendVendorInterest).toHaveBeenCalledTimes(1);
    const [inbox, payload] = emailService.sendVendorInterest.mock.calls[0];
    expect(inbox).toBe('chibueze@chopnow.app');
    expect(payload).toMatchObject(valid);
  });

  it.each([
    [{ ...valid, businessName: '' }, /business name/i],
    [{ ...valid, contactName: 'A' }, /contact person/i],
    [{ ...valid, phone: 'call me' }, /phone/i],
    [{ ...valid, phone: '12345' }, /phone/i],
    [{ ...valid, email: 'nope' }, /valid email/i],
    [{ ...valid, email: ['a@b.co'] }, /valid email/i],
    [{ ...valid, location: '' }, /where/i],
    [{ ...valid, foodType: '' }, /kind of food/i],
    [{ ...valid, message: 'x'.repeat(1001) }, /1000/],
  ])('refuses invalid input %#', async (body, expected) => {
    const res = await send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(expected);
    expect(emailService.sendVendorInterest).not.toHaveBeenCalled();
  });

  it('quietly drops a bot that filled the hidden field', async () => {
    const res = await send({ ...valid, website: 'http://spam.example' });
    expect(res.status).toBe(202);
    expect(emailService.sendVendorInterest).not.toHaveBeenCalled();
  });

  it('tells the visitor when the mail provider could not deliver it', async () => {
    emailService.sendVendorInterest.mockResolvedValueOnce(false);
    const res = await send(valid);
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/chibueze@chopnow\.app/);
  });

  it('shows ChopNow’s fee in the public settings so the page never hard-codes it', async () => {
    const res = await request(app).get('/api/v1/settings/public');
    expect(res.status).toBe(200);
    expect(res.body.platformFeePercent).toBe(10);
  });
});

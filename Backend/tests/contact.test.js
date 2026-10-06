/**
 * The public Contact page must really deliver the message to the support inbox
 * (the form used to have no handler at all).
 */
const request = require('supertest');
const app = require('./app');
const emailService = require('../utils/emailService');

const send = (body) => request(app).post('/api/v1/contact').send(body);
const valid = {
  name: 'Aline Uwimana',
  email: 'aline@example.org',
  message: 'Hello, how do I become a vendor on ChopNow?',
};

describe('POST /api/v1/contact', () => {
  beforeEach(() => emailService.sendContactMessage.mockClear());

  it('sends the message to the support inbox with the sender as reply-to', async () => {
    const res = await send(valid);
    expect(res.status).toBe(202);
    expect(emailService.sendContactMessage).toHaveBeenCalledTimes(1);
    const [inbox, payload] = emailService.sendContactMessage.mock.calls[0];
    expect(inbox).toBe('chopnow.app@gmail.com');
    expect(payload).toEqual(valid);
  });

  it.each([
    [{ ...valid, name: '' }, /name/i],
    [{ ...valid, email: 'nope' }, /valid email/i],
    [{ ...valid, message: 'short' }, /message/i],
    [{ ...valid, email: ['a@b.co'] }, /valid email/i],
  ])('refuses invalid input %#', async (body, expected) => {
    const res = await send(body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(expected);
    expect(emailService.sendContactMessage).not.toHaveBeenCalled();
  });

  it('tells the visitor when the mail provider could not deliver it', async () => {
    emailService.sendContactMessage.mockResolvedValueOnce(false);
    const res = await send(valid);
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/chopnow\.app@gmail\.com/);
  });
});

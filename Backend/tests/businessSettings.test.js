/**
 * The vendor Settings page used to send hours, tagline, contact details and the
 * map pin to updateBusiness, which silently dropped most of them while the page
 * said "saved". These tests pin what actually gets stored.
 */
jest.mock('../utils/cloudinaryUpload', () => ({
  uploadToCloudinary: jest.fn().mockResolvedValue({ secure_url: 'https://cdn.example/doc.pdf' }),
  uploadMultipleToCloudinary: jest.fn(),
}));
const request = require('supertest');
const app = require('./app');
const Business = require('../models/Business');
const { createBusinessOwnerWithBusiness } = require('./fixtures');

const put = (token, id, body) =>
  request(app).put(`/api/v1/businesses/${id}`).set('Authorization', `Bearer ${token}`).send(body);

describe('PUT /api/v1/businesses/:id (vendor settings)', () => {
  it('stores tagline, contact details, phone and opening hours', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const hours = [
      { day: 'Monday', from: '08:00', to: '18:00', closed: false },
      { day: 'Sunday', from: '', to: '', closed: true },
    ];
    const res = await put(token, business._id, {
      tagline: 'Fresh daily',
      contactPerson: 'Jean Habimana',
      contactEmail: 'jean@example.org',
      phone: '+250 788 654 321',
      businessHours: hours,
      specialHours: [
        { date: '2026-12-25', description: 'Christmas', from: '', to: '', closed: true },
      ],
    });
    expect(res.status).toBe(200);

    const saved = await Business.findById(business._id).lean();
    expect(saved.tagline).toBe('Fresh daily');
    expect(saved.contactPerson).toBe('Jean Habimana');
    expect(saved.contactEmail).toBe('jean@example.org');
    expect(saved.phone).toBe('+250 788 654 321');
    expect(saved.businessHours.map((h) => [h.day, h.from, h.closed])).toEqual([
      ['Monday', '08:00', false],
      ['Sunday', '', true],
    ]);
    expect(saved.specialHours[0]).toMatchObject({ date: '2026-12-25', closed: true });
  });

  it('merges a new street into the stored address and moves the map pin', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness({
      address: { street: 'Old St', city: 'Kigali' },
    });
    const res = await put(token, business._id, {
      address: {
        street: 'KG 7 Ave',
        location: { type: 'Point', coordinates: [30.1, -1.95] },
      },
    });
    expect(res.status).toBe(200);
    const saved = await Business.findById(business._id).lean();
    expect(saved.address).toMatchObject({
      street: 'KG 7 Ave',
      city: 'Kigali',
      lat: -1.95,
      lng: 30.1,
    });
    expect(saved.location.coordinates).toEqual([30.1, -1.95]);
  });

  it('ignores a (0,0) or out-of-range pin instead of corrupting the geo index', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness({
      location: { type: 'Point', coordinates: [30.06, -1.94] },
    });
    await put(token, business._id, { address: { street: 'X', location: { coordinates: [0, 0] } } });
    await put(token, business._id, {
      address: { street: 'X', location: { coordinates: [500, 200] } },
    });
    const saved = await Business.findById(business._id).lean();
    expect(saved.location.coordinates).toEqual([30.06, -1.94]);
  });

  it.each([
    [
      { businessHours: [{ day: 'Monday', from: '18:00', to: '08:00', closed: false }] },
      /closing time/,
    ],
    [{ contactEmail: 'not-an-email' }, /valid email/],
    [{ phone: 'abc' }, /valid phone/],
    [{ businessHours: [{ day: 'Funday', from: '08:00', to: '09:00' }] }, /./],
  ])('refuses invalid input %#', async (body, message) => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const res = await put(token, business._id, body);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(message);
  });
});

describe('POST /api/v1/businesses/:id/kyc for an approved business', () => {
  it('keeps the business approved when it adds a document', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness({
      verification: { status: 'approved' },
    });
    // No Cloudinary in tests: without a file the handler records nothing but must not demote.
    await request(app)
      .post(`/api/v1/businesses/${business._id}/kyc`)
      .set('Authorization', `Bearer ${token}`);
    const saved = await Business.findById(business._id).lean();
    expect(saved.verification.status).toBe('approved');
    expect(saved.status).toBe('active');
  });
});

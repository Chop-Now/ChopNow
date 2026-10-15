/**
 * A shop only goes live with a document, its real location and a number to call. The vendor is
 * stopped at submission (before anything is uploaded) and an admin can't approve around it.
 */
jest.mock('../utils/cloudinaryUpload', () => ({
  uploadToCloudinary: jest
    .fn()
    .mockResolvedValue({ secure_url: 'https://res.cloudinary.com/x/permit.jpg' }),
  uploadMultipleToCloudinary: jest.fn(),
}));
const request = require('supertest');
const app = require('./app');
const Business = require('../models/Business');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { createAdmin, createBusinessOwnerWithBusiness } = require('./fixtures');

const KIGALI = JSON.stringify({ lat: -1.9515, lng: 30.0935 });
const PNG = Buffer.from('89504e470d0a1a0a', 'hex');

const newShop = () =>
  createBusinessOwnerWithBusiness({
    status: 'inactive',
    verification: { status: 'unverified', documents: [] },
  });

const submit = (token, id, fields = {}, { withFile = true } = {}) => {
  let req = request(app)
    .post(`/api/v1/businesses/${id}/kyc`)
    .set('Authorization', `Bearer ${token}`);
  Object.entries(fields).forEach(([key, value]) => (req = req.field(key, value)));
  if (withFile) {
    req = req.attach('documents', PNG, { filename: 'permit.png', contentType: 'image/png' });
  }
  return req;
};

beforeEach(() => uploadToCloudinary.mockClear());

describe('a shop submitting for review', () => {
  it('is stopped without a location, and nothing is uploaded', async () => {
    const { token, business } = await newShop();
    const res = await submit(token, business._id, { phone: '0788123456' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/location/i);
    expect(uploadToCloudinary).not.toHaveBeenCalled();
    expect((await Business.findById(business._id)).verification.status).toBe('unverified');
  });

  it('is stopped without a Rwandan mobile number', async () => {
    const { token, business } = await newShop();
    const res = await submit(token, business._id, { phone: '12345', location: KIGALI });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/mobile number/i);
    expect(uploadToCloudinary).not.toHaveBeenCalled();
  });

  it('is stopped when the pin is not in Rwanda', async () => {
    const { token, business } = await newShop();
    const res = await submit(token, business._id, {
      phone: '0788123456',
      location: JSON.stringify({ lat: 51.5, lng: -0.12 }),
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/outside Rwanda/i);
  });

  it('is stopped without a document', async () => {
    const { token, business } = await newShop();
    const res = await submit(
      token,
      business._id,
      { phone: '0788123456', location: KIGALI },
      { withFile: false }
    );
    expect(res.status).toBe(400);
  });

  it('goes to review with document, location and number, and stores them where the app reads them', async () => {
    const { token, business } = await newShop();
    const res = await submit(token, business._id, {
      phone: '0788 123 456',
      location: KIGALI,
      address: 'KG 7 Ave, Kimihurura',
    });
    expect(res.status).toBe(200);
    const saved = await Business.findById(business._id).lean();
    expect(saved.verification.status).toBe('pending');
    expect(saved.verification.documents).toHaveLength(1);
    expect(saved.location.coordinates).toEqual([30.0935, -1.9515]);
    expect(saved.phone).toBe('+250788123456');
    expect(saved.contact.phone).toBe('+250788123456');
  });

  it('can add another document later without sending the location and number again', async () => {
    const { token, business } = await newShop();
    await submit(token, business._id, { phone: '0788123456', location: KIGALI });
    const again = await submit(token, business._id, {});
    expect(again.status).toBe(200);
    expect((await Business.findById(business._id)).verification.documents).toHaveLength(2);
  });
});

describe('an admin approving a shop', () => {
  const approve = (adminToken, id) =>
    request(app)
      .patch(`/api/v1/businesses/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

  it('cannot approve one with nothing on file, and is told what is missing', async () => {
    const admin = await createAdmin();
    const { business } = await newShop();
    const res = await approve(admin.token, business._id);
    expect(res.status).toBe(400);
    expect(res.body.missing.join(' ')).toMatch(/document/i);
    expect(res.body.missing.join(' ')).toMatch(/location/i);
    expect(res.body.missing.join(' ')).toMatch(/mobile number/i);
    expect((await Business.findById(business._id)).status).toBe('inactive');
  });

  it('approves one that has everything', async () => {
    const admin = await createAdmin();
    const { token, business } = await newShop();
    await submit(token, business._id, { phone: '0788123456', location: KIGALI });
    const res = await approve(admin.token, business._id);
    expect(res.status).toBe(200);
    expect((await Business.findById(business._id)).status).toBe('active');
  });

  it('does not re-check a shop that is already live', async () => {
    const admin = await createAdmin();
    const { business } = await createBusinessOwnerWithBusiness({
      verification: { status: 'approved' },
    });
    const res = await approve(admin.token, business._id);
    expect(res.status).toBe(200);
  });
});

/**
 * When an admin rejects an application or asks for more information, the
 * reason has to reach the vendor: the fields used to be missing from the
 * schema, so Mongoose silently dropped them and the vendor was left guessing.
 */
const request = require('supertest');
const app = require('./app');
const Business = require('../models/Business');
const { createAdmin, createBusinessOwnerWithBusiness } = require('./fixtures');

const pendingBusiness = () =>
  createBusinessOwnerWithBusiness({
    status: 'inactive',
    verification: { status: 'pending', submittedAt: new Date() },
  });

describe('verification feedback reaches the vendor', () => {
  it('stores the admin message when more info is requested and returns it to the owner', async () => {
    const admin = await createAdmin();
    const { token, business } = await pendingBusiness();

    const res = await request(app)
      .patch(`/api/v1/businesses/${business._id}/request-info`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ message: 'Please upload a clearer photo of your permit.' });
    expect(res.status).toBe(200);

    const list = await request(app)
      .get('/api/v1/businesses/my/list')
      .set('Authorization', `Bearer ${token}`);
    const mine = list.body.businesses[0];
    expect(mine.verification.status).toBe('info_requested');
    expect(mine.verification.infoRequestMessage).toBe(
      'Please upload a clearer photo of your permit.'
    );
    expect(mine.verification.reviewedAt).toBeTruthy();
  });

  it('stores the rejection reason', async () => {
    const admin = await createAdmin();
    const { token, business } = await pendingBusiness();

    const res = await request(app)
      .patch(`/api/v1/businesses/${business._id}/reject`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ reason: 'The permit has expired.' });
    expect(res.status).toBe(200);

    const list = await request(app)
      .get('/api/v1/businesses/my/list')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.businesses[0].verification.status).toBe('rejected');
    expect(list.body.businesses[0].verification.rejectionReason).toBe('The permit has expired.');
  });

  it('clears the old reason once the vendor is approved', async () => {
    const admin = await createAdmin();
    const { business } = await pendingBusiness();

    await request(app)
      .patch(`/api/v1/businesses/${business._id}/reject`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ reason: 'Blurry documents.' });
    const approve = await request(app)
      .patch(`/api/v1/businesses/${business._id}/approve`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({});
    expect(approve.status).toBe(200);

    const fresh = await Business.findById(business._id).lean();
    expect(fresh.verification.status).toBe('approved');
    expect(fresh.verification.rejectionReason).toBeUndefined();
    expect(fresh.status).toBe('active');
  });
});

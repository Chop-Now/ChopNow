/**
 * Deleting an account must not strand anyone: no deleting while an order is in
 * progress or while a business still holds money, and a closed business stops
 * being shown to customers.
 */
const request = require('supertest');
const app = require('./app');
const User = require('../models/User');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Order = require('../models/Order');
const {
  createConsumer,
  createBusinessOwnerWithBusiness,
  createListing,
  createAdmin,
} = require('./fixtures');

const del = (token) =>
  request(app).delete('/api/v1/users/profile').set('Authorization', `Bearer ${token}`);

async function placeOrder(consumerToken, listing) {
  const res = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${consumerToken}`)
    .send({
      listing: listing._id.toString(),
      items: [{ listing: listing._id.toString(), quantity: 1 }],
      fulfillmentType: 'pickup',
      payment: { paymentMethod: 'mobile_money' },
    });
  return res.body;
}

describe('DELETE /api/v1/users/profile', () => {
  it('refuses while the buyer has an order in progress, allows it once completed', async () => {
    const { business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { token, user } = await createConsumer();
    const order = await placeOrder(token, listing);
    await Order.findByIdAndUpdate(order._id, { status: 'preparing' });

    const blocked = await del(token);
    expect(blocked.status).toBe(409);
    expect(blocked.body.message).toMatch(/order in progress/i);
    expect(await User.findById(user._id)).not.toBeNull();

    await Order.findByIdAndUpdate(order._id, { status: 'completed' });
    expect((await del(token)).status).toBe(200);
    expect(await User.findById(user._id)).toBeNull();
  });

  it('refuses while the vendor still holds money, then closes the shop when it is empty', async () => {
    const { token, user, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    await Business.updateOne({ _id: business._id }, { 'stats.balance': 12000 });

    const blocked = await del(token);
    expect(blocked.status).toBe(409);
    expect(blocked.body.message).toMatch(/12,000/);

    await Business.updateOne({ _id: business._id }, { 'stats.balance': 0 });
    expect((await del(token)).status).toBe(200);

    expect(await User.findById(user._id)).toBeNull();
    expect((await Business.findById(business._id)).status).toBe('inactive');
    expect((await Listing.findById(listing._id)).status).toBe('inactive');
  });

  it('refuses while customers are waiting on the vendor', async () => {
    const { token, business } = await createBusinessOwnerWithBusiness();
    const listing = await createListing(business);
    const { token: buyerToken } = await createConsumer();
    const order = await placeOrder(buyerToken, listing);
    await Order.findByIdAndUpdate(order._id, { status: 'paid' });

    const res = await del(token);
    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/orders in progress/i);
  });

  it('applies the same rule when an admin deletes the user', async () => {
    const { user, business } = await createBusinessOwnerWithBusiness();
    await Business.updateOne({ _id: business._id }, { 'stats.balance': 500 });
    const admin = await createAdmin();

    const res = await request(app)
      .delete(`/api/v1/users/${user._id}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(409);
    expect(await User.findById(user._id)).not.toBeNull();
  });
});

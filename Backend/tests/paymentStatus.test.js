/**
 * Payment status polling fallback idempotency tests (H9, getPaymentStatus)
 *
 * GET /payments/status/:orderId polls pawaPay directly while the local
 * Payment is still 'pending'. It used to read-check-then-save the Payment and
 * Order, so two concurrent polls that both saw a remote FAILED status could
 * both cancel the order and both restore the reserved listing stock.
 *
 * axios is mocked so the "remote" pawaPay status is whatever each test says.
 */
jest.mock('axios');

const axios = require('axios');
const request = require('supertest');
const app = require('./app');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const { createConsumer, createBusinessOwnerWithBusiness, createListing } = require('./fixtures');

const originalApiKey = process.env.PAWAPAY_API_KEY;
const originalTestMode = process.env.PAYMENT_TEST_MODE;

beforeAll(() => {
  process.env.PAWAPAY_API_KEY = 'test-pawapay-key';
  // Exercise the real (sandbox) polling path; in test mode there's nothing to poll.
  process.env.PAYMENT_TEST_MODE = 'false';
});

afterAll(() => {
  if (originalApiKey === undefined) delete process.env.PAWAPAY_API_KEY;
  else process.env.PAWAPAY_API_KEY = originalApiKey;
  if (originalTestMode === undefined) delete process.env.PAYMENT_TEST_MODE;
  else process.env.PAYMENT_TEST_MODE = originalTestMode;
});

afterEach(() => {
  axios.get.mockReset();
});

function mockRemoteStatus(data) {
  axios.get.mockResolvedValue({ data: { status: 'FOUND', data } });
}

async function createPendingMobileMoneyOrder({ quantity = 2, startingStock = 5 } = {}) {
  const { business } = await createBusinessOwnerWithBusiness();
  const listing = await createListing(business, {
    pricing: { price: 4000, currency: 'RWF' },
    inventory: { quantity: startingStock },
  });
  const { token } = await createConsumer();

  const orderRes = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      listing: listing._id.toString(),
      items: [{ listing: listing._id.toString(), quantity }],
      fulfillmentType: 'pickup',
      payment: { paymentMethod: 'mobile_money' },
    });
  const order = orderRes.body;

  const depositId = `dep-${order._id}`;
  await Payment.create({
    order: order._id,
    depositId,
    amount: order.pricing.total,
    currency: order.pricing.currency,
    payerPhoneNumber: '+250700000000',
    correspondent: 'MTN_MOMO_RWA',
    status: 'pending',
  });

  return { order, listing, depositId, token };
}

function pollStatus(orderId, token) {
  return request(app)
    .get(`/api/v1/payments/status/${orderId}`)
    .set('Authorization', `Bearer ${token}`);
}

describe('GET /api/v1/payments/status/:orderId - idempotency (H9)', () => {
  it('should restore reserved stock exactly once for two concurrent polls that see FAILED', async () => {
    const { order, listing, token } = await createPendingMobileMoneyOrder({
      quantity: 2,
      startingStock: 5,
    });

    const afterOrder = await Listing.findById(listing._id);
    expect(afterOrder.inventory.quantity).toBe(3); // 5 - 2 reserved

    mockRemoteStatus({ status: 'FAILED', failureReason: { code: 'X', description: 'Y' } });

    const [first, second] = await Promise.all([
      pollStatus(order._id, token),
      pollStatus(order._id, token),
    ]);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.body.status).toBe('failed');
    expect(second.body.status).toBe('failed');

    const afterPolls = await Listing.findById(listing._id);
    // Must be back to 5, never 7 (which would mean stock was restored twice).
    expect(afterPolls.inventory.quantity).toBe(5);
    expect(afterPolls.inventory.reserved).toBe(0);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe('cancelled');
    expect(updatedOrder.payment.paymentStatus).toBe('failed');
  });

  it('should not restore stock again when the webhook already processed the failure', async () => {
    const { order, listing, depositId, token } = await createPendingMobileMoneyOrder({
      quantity: 2,
      startingStock: 5,
    });

    mockRemoteStatus({ status: 'FAILED' });

    await Promise.all([
      request(app).post('/api/v1/payments/webhook').send({ depositId, status: 'FAILED' }),
      pollStatus(order._id, token),
    ]);

    const afterBoth = await Listing.findById(listing._id);
    expect(afterBoth.inventory.quantity).toBe(5);
    expect(afterBoth.inventory.reserved).toBe(0);
  });

  it('should mark the order paid once for two concurrent polls that see COMPLETED', async () => {
    const { order, token } = await createPendingMobileMoneyOrder();

    mockRemoteStatus({ status: 'COMPLETED', providerTransactionId: 'ptx-456' });

    const [first, second] = await Promise.all([
      pollStatus(order._id, token),
      pollStatus(order._id, token),
    ]);
    expect(first.body.status).toBe('completed');
    expect(second.body.status).toBe('completed');

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe('paid');
    expect(updatedOrder.payment.paymentStatus).toBe('completed');

    const payment = await Payment.findOne({ order: order._id });
    expect(payment.providerTransactionId).toBe('ptx-456');
  });
});

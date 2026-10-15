/**
 * Delivery orders are carried by an outside courier (Moving Man). With the courier set up:
 *  - the delivery fee is the courier's own price for that shop and that spot;
 *  - sending the order out books a rider, and only then moves the order on;
 *  - nothing is ever booked twice, and a refusal leaves the order where it was.
 * The courier is a fake here: no test can reach the real one.
 */
const request = require('supertest');
const app = require('./app');
const Order = require('../models/Order');
const Business = require('../models/Business');
const courier = require('../services/movingManService');
const {
  createBusinessOwnerWithBusiness,
  createConsumer,
  createListing,
  placePaidOrder,
} = require('./fixtures');

const DROP = {
  address: 'KG 108 Street, Remera',
  location: { lat: -1.958722, lng: 30.119739 },
  recipientPhone: '0788 123 456',
};
const quoteBody = (listing, deliveryDetails = DROP) => ({
  items: [{ listing: listing._id.toString(), quantity: 1 }],
  fulfillmentType: 'delivery',
  payment: { paymentMethod: 'mobile_money' },
  ...(deliveryDetails ? { deliveryDetails } : {}),
});

let calls;
const json = (status, body) => ({ ok: status < 400, status, json: async () => body });
const fakeCourier = ({ quoteResponse, requestResponse } = {}) => {
  calls = [];
  global.fetch = jest.fn(async (url, init) => {
    const path = new URL(url).pathname;
    const body = JSON.parse(init.body);
    calls.push({ path, body, headers: init.headers });
    if (path === '/api/quote') {
      return (
        quoteResponse ||
        json(200, {
          ok: true,
          price: { amount_rwf: 1370, currency: 'RWF', distance_km: 3.85, est_minutes: 8 },
        })
      );
    }
    return (
      requestResponse ||
      json(201, {
        ok: true,
        duplicate: false,
        booking_reference: 'MM-1010-A01',
        price: { amount_rwf: 1370, distance_km: 3.85 },
      })
    );
  });
};

const realFetch = global.fetch;
beforeEach(() => {
  process.env.MOVING_MAN_API_KEY = 'mm_test_key';
  process.env.MOVING_MAN_COMPANY = 'ChopNow';
  courier.resetForTests();
  fakeCourier();
});
afterEach(() => {
  process.env.MOVING_MAN_API_KEY = '';
  process.env.MOVING_MAN_COMPANY = '';
  global.fetch = realFetch;
});

async function shop(overrides = {}) {
  const vendor = await createBusinessOwnerWithBusiness({
    name: 'Kigali Bakery',
    location: { type: 'Point', coordinates: [30.0935, -1.9515] },
    ...overrides,
  });
  const listing = await createListing(vendor.business, {
    fulfillment: 'delivery',
    pricing: { price: 3000 },
  });
  return { vendor, listing };
}

describe('delivery price from the courier', () => {
  it('charges the courier price for that shop and spot, and sends the company name and key', async () => {
    const { listing } = await shop();
    const res = await request(app).post('/api/v1/orders/quote').send(quoteBody(listing));
    expect(res.status).toBe(200);
    expect(res.body.vendors[0].pricing.deliveryFee).toBe(1370);
    expect(res.body.totals.deliveryFee).toBe(1370);
    expect(res.body.totals.total).toBe(3000 + 1370 + res.body.totals.tax);
    expect(res.body.options.courierDelivery).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].path).toBe('/api/quote');
    expect(calls[0].body.booking_company).toBe('ChopNow');
    expect(calls[0].body.restaurant_pin).toBe('-1.951500,30.093500');
    expect(calls[0].body.receiver_pin).toBe('-1.958722,30.119739');
    expect(calls[0].headers['X-API-Key']).toBe('mm_test_key');
  });

  it('asks the courier once for the same shop and spot', async () => {
    const { listing } = await shop();
    await request(app).post('/api/v1/orders/quote').send(quoteBody(listing));
    await request(app).post('/api/v1/orders/quote').send(quoteBody(listing));
    expect(calls).toHaveLength(1);
  });

  it('asks for a delivery location before it can price a delivery', async () => {
    const { listing } = await shop();
    const res = await request(app).post('/api/v1/orders/quote').send(quoteBody(listing, null));
    expect(res.status).toBe(200);
    expect(res.body.options.deliveryNeedsLocation).toBe(true);
    expect(res.body.totals.deliveryFee).toBe(0);
    expect(calls).toHaveLength(0);
  });

  it('keeps pickup free of any courier call', async () => {
    const { listing } = await shop();
    const res = await request(app)
      .post('/api/v1/orders/quote')
      .send({ ...quoteBody(listing), fulfillmentType: 'pickup' });
    expect(res.status).toBe(200);
    expect(res.body.totals.deliveryFee).toBe(0);
    expect(calls).toHaveLength(0);
  });

  it('says plainly when the address is outside Kigali', async () => {
    fakeCourier({
      quoteResponse: json(422, {
        ok: false,
        error: { code: 'OUTSIDE_SERVICE_AREA', message: 'x' },
      }),
    });
    const { listing } = await shop();
    const res = await request(app).post('/api/v1/orders/quote').send(quoteBody(listing));
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/inside Kigali/);
  });

  it('tells the customer a shop with no map location cannot deliver yet', async () => {
    const { listing } = await shop({ location: undefined });
    const res = await request(app).post('/api/v1/orders/quote').send(quoteBody(listing));
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/Kigali Bakery has not set its pickup location/);
  });

  it('does not expose a courier outage as a server error', async () => {
    fakeCourier({
      quoteResponse: json(503, {
        ok: false,
        error: { code: 'NOT_ACCEPTING_ORDERS', message: 'x' },
      }),
    });
    const { listing } = await shop();
    const res = await request(app).post('/api/v1/orders/quote').send(quoteBody(listing));
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/temporarily unavailable/);
  });

  it('falls back to the flat fee when the courier is not set up', async () => {
    process.env.MOVING_MAN_API_KEY = '';
    const { listing } = await shop();
    const res = await request(app).post('/api/v1/orders/quote').send(quoteBody(listing));
    expect(res.status).toBe(200);
    expect(res.body.options.courierDelivery).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it('refuses a delivery with no number the rider can call, or one that is not a Rwandan mobile', async () => {
    const { listing } = await shop();
    const customer = await createConsumer();
    const place = (recipientPhone) =>
      request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customer.token}`)
        .send({
          listing: listing._id.toString(),
          items: [{ listing: listing._id.toString(), quantity: 1 }],
          fulfillmentType: 'delivery',
          deliveryDetails: { ...DROP, recipientPhone },
          payment: { paymentMethod: 'mobile_money' },
        });
    const none = await place(undefined);
    expect(none.status).toBe(400);
    expect(none.body.message).toMatch(/phone number the rider can call/);
    const bad = await place('12345');
    expect(bad.status).toBe(400);
    expect(bad.body.message).toMatch(/Rwandan mobile/);
    const good = await place('+250 788 123 456');
    expect(good.status).toBe(201);
    const stored = await Order.findById(good.body._id).lean();
    expect(stored.deliveryDetails.recipientPhone).toBe('+250788123456');
  });

  it('keeps the courier quote on the placed order, and refuses a delivery with no location', async () => {
    const { listing } = await shop();
    const customer = await createConsumer();
    const placed = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        listing: listing._id.toString(),
        items: [{ listing: listing._id.toString(), quantity: 1 }],
        fulfillmentType: 'delivery',
        deliveryDetails: DROP,
        payment: { paymentMethod: 'mobile_money' },
      });
    expect(placed.status).toBe(201);
    expect(placed.body.pricing.deliveryFee).toBe(1370);
    const stored = await Order.findById(placed.body._id).lean();
    expect(stored.courier).toMatchObject({
      provider: 'moving_man',
      quotedRwf: 1370,
      distanceKm: 3.85,
    });

    const refused = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        listing: listing._id.toString(),
        items: [{ listing: listing._id.toString(), quantity: 1 }],
        fulfillmentType: 'delivery',
        deliveryDetails: { address: 'Somewhere in Remera' },
        payment: { paymentMethod: 'mobile_money' },
      });
    expect(refused.status).toBe(400);
    expect(refused.body.message).toMatch(/delivery location/);
  });
});

describe('booking the courier when the vendor sends the order out', () => {
  async function paidDeliveryOrder() {
    const { vendor, listing } = await shop();
    const customer = await createConsumer();
    const { order } = await placePaidOrder(customer.token, listing, {
      fulfillmentType: 'delivery',
      deliveryDetails: DROP,
    });
    return { vendor, order };
  }
  const send = (vendor, order) =>
    request(app)
      .put(`/api/v1/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${vendor.token}`)
      .send({ status: 'out_for_delivery' });

  it('books a rider on the ChopNow account, stores the reference, and moves the order on', async () => {
    const { vendor, order } = await paidDeliveryOrder();
    calls.length = 0;
    const res = await send(vendor, order);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('out_for_delivery');

    const booking = calls.find((c) => c.path === '/api/request');
    expect(booking.body).toMatchObject({
      external_reference: order.orderNumber,
      booking_company: 'ChopNow',
      item_type: 'Food',
      payer: 'sender',
      pay_method: 'account',
      pickup_time: 'now',
      receiver_address: 'KG 108 Street, Remera',
      receiver_phone: '+250788123456',
      restaurant_pin: '-1.951500,30.093500',
      receiver_pin: '-1.958722,30.119739',
    });
    const stored = await Order.findById(order._id).lean();
    expect(stored.courier).toMatchObject({
      provider: 'moving_man',
      bookingReference: 'MM-1010-A01',
      bookedRwf: 1370,
      quotedRwf: 1370,
    });
  });

  it('leaves the order where it was, and says why, when the courier cannot take it', async () => {
    const { vendor, order } = await paidDeliveryOrder();
    fakeCourier({
      requestResponse: json(503, {
        ok: false,
        error: { code: 'NOT_ACCEPTING_ORDERS', message: 'x' },
      }),
    });
    const res = await send(vendor, order);
    expect(res.status).toBe(503);
    expect(res.body.code).toBe('COURIER_BOOKING_FAILED');
    const stored = await Order.findById(order._id).lean();
    expect(stored.status).toBe('paid');
    expect(stored.courier.bookingReference).toBeUndefined();

    // Trying again once the courier is back works, with the same order number.
    fakeCourier();
    const retry = await send(vendor, order);
    expect(retry.status).toBe(200);
    expect(calls.find((c) => c.path === '/api/request').body.external_reference).toBe(
      order.orderNumber
    );
  });

  it('does not book again for an order that already has a booking', async () => {
    const { vendor, order } = await paidDeliveryOrder();
    await Order.updateOne(
      { _id: order._id },
      { $set: { 'courier.bookingReference': 'MM-OLD-001', 'courier.provider': 'moving_man' } }
    );
    calls.length = 0;
    const res = await send(vendor, order);
    expect(res.status).toBe(200);
    expect(calls.filter((c) => c.path === '/api/request')).toHaveLength(0);
  });

  it('tells the vendor when the customer has no phone number to give the rider', async () => {
    const { vendor, order } = await paidDeliveryOrder();
    const Payment = require('../models/Payment');
    await Payment.updateMany({}, { $unset: { payerPhoneNumber: '' } });
    const User = require('../models/User');
    await User.updateOne({ _id: order.customer }, { $unset: { phone: '' } });
    // an order placed before riders needed a number
    await Order.updateOne({ _id: order._id }, { $unset: { 'deliveryDetails.recipientPhone': '' } });
    const res = await send(vendor, order);
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/phone number/);
    expect((await Order.findById(order._id).lean()).status).toBe('paid');
  });

  it('keeps working as before when the courier is not set up', async () => {
    process.env.MOVING_MAN_API_KEY = '';
    const { vendor, listing } = await shop();
    const customer = await createConsumer();
    const { order } = await placePaidOrder(customer.token, listing, {
      fulfillmentType: 'delivery',
      deliveryDetails: DROP,
    });
    const res = await send(vendor, order);
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(0);
    expect(await Business.countDocuments()).toBe(1);
  });
});

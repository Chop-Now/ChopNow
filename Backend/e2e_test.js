const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://127.0.0.1:5000/api/v1';

async function runE2E() {
  console.log('Starting E2E Tests...');
  let consumerToken, vendorToken, riderToken, adminToken;
  let listingId, orderId, deliveryId;
  
  try {
    // 1. Consumer Reg & Login
    const consumerEmail = `consumer_${Date.now()}@test.com`;
    let res = await axios.post(`${BASE_URL}/users/register`, {
      firstName: 'E2E',
      lastName: 'Consumer',
      email: consumerEmail,
      password: 'Password123',
      phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`
    });
    consumerToken = res.data.token;
    console.log('✅ Consumer Registered');

    // 2. Vendor Reg & Login
    const vendorEmail = `vendor_${Date.now()}@test.com`;
    res = await axios.post(`${BASE_URL}/users/register`, {
      firstName: 'E2E',
      lastName: 'Vendor',
      email: vendorEmail,
      password: 'Password123',
      phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`
    });
    vendorToken = res.data.token;
    
    // Add business_owner role to vendor in DB
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chopnow';
    await mongoose.connect(dbUri);
    await mongoose.connection.collection('users').updateOne({ email: vendorEmail }, { $addToSet: { roles: 'business_owner' } });

    // Switch to business owner
    res = await axios.post(`${BASE_URL}/users/switch-role`, { role: 'business_owner' }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    console.log('✅ Vendor Registered & Switched Role. ActiveRole is:', res.data.activeRole);
    
    // Create Business
    res = await axios.post(`${BASE_URL}/businesses`, {
      name: 'E2E Bakery',
      description: 'Test Bakery',
      type: 'restaurant',
      contact: {
        email: vendorEmail,
        phone: '+250781234567'
      },
      address: { street: 'KG 11 Ave', city: 'Kigali', location: { coordinates: [30.1, -1.9] } }
    }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    const businessId = res.data._id;
    
    // Create Listing
    res = await axios.post(`${BASE_URL}/listings`, {
      business: businessId,
      title: 'E2E Bread',
      description: 'Leftover bread',
      category: 'baked-goods',
      pricing: { price: 1500, originalPrice: 3000 },
      inventory: { quantity: 5 },
      timeWindow: { availableFrom: new Date(), availableUntil: new Date(Date.now() + 3600000) },
      fulfillment: 'delivery'
    }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    listingId = res.data._id;
    console.log('✅ Vendor Created Business & Listing');

    // 3. Consumer Order
    res = await axios.post(`${BASE_URL}/orders`, {
      business: businessId,
      listing: listingId,
      items: [{
        listing: listingId,
        quantity: 1,
        unitPrice: 1500
      }],
      fulfillmentType: 'delivery',
      deliveryDetails: { address: { street: 'KG 11 Ave', city: 'Kigali', coordinates: [30.1, -1.9] } },
      payment: { paymentMethod: 'cash' },
      totalAmount: 1500
    }, { headers: { Authorization: `Bearer ${consumerToken}` } });
    orderId = res.data._id;
    console.log('✅ Consumer Placed Order');

    // Vendor accepts order
    res = await axios.put(`${BASE_URL}/orders/${orderId}/status`, { status: 'confirmed' }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    console.log('✅ Vendor Accepted Order');

    // Vendor marks ready and creates delivery
    res = await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
      status: 'ready_for_pickup'
    }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    
    // Create delivery record
    res = await axios.post(`${BASE_URL}/deliveries`, { orderId }, { headers: { Authorization: `Bearer ${vendorToken}` } });
    console.log('✅ Vendor Marked Order Ready for Pickup');

    // Rider registration
    const riderEmail = `rider_${Date.now()}@test.com`;
    res = await axios.post(`${BASE_URL}/users/register`, {
      firstName: 'E2E',
      lastName: 'Rider',
      email: riderEmail,
      password: 'Password123',
      phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`
    });
    riderToken = res.data.token;
    
    // The rider application needs to be approved. We bypass by updating DB directly
    await mongoose.connection.collection('users').updateOne({ email: riderEmail }, { $set: { roles: ['consumer', 'rider'], activeRole: 'rider' } });
    console.log('✅ Rider Registered & Approved');
    
    res = await axios.get(`${BASE_URL}/deliveries/available?lat=-1.9&lng=30.1&radius=5`, { headers: { Authorization: `Bearer ${riderToken}` } });
    deliveryId = res.data.deliveries[0]._id;
    
    // Rider assigns delivery
    res = await axios.patch(`${BASE_URL}/deliveries/${deliveryId}/assign`, {}, { headers: { Authorization: `Bearer ${riderToken}` } });
    console.log('✅ Rider Assigned to Delivery');
    
    // Rider picks up delivery
    res = await axios.patch(`${BASE_URL}/deliveries/${deliveryId}/status`, { status: 'picked_up' }, { headers: { Authorization: `Bearer ${riderToken}` } });
    console.log('✅ Rider Picked Up Delivery');

    // Rider in transit
    res = await axios.patch(`${BASE_URL}/deliveries/${deliveryId}/status`, { status: 'in_transit' }, { headers: { Authorization: `Bearer ${riderToken}` } });
    console.log('✅ Rider In Transit');

    // Rider completes delivery
    res = await axios.patch(`${BASE_URL}/deliveries/${deliveryId}/status`, { status: 'delivered' }, { headers: { Authorization: `Bearer ${riderToken}` } });
    console.log('✅ Rider Completed Delivery');

    console.log('🎉 ALL E2E TESTS PASSED!');
    process.exit(0);

  } catch (error) {
    console.error('❌ E2E TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
}

runE2E();

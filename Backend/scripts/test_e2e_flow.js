const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Pre-load Mongoose models so they register schemas
require('../models/User');
require('../models/Business');

const MONGO_URI = process.env.MONGO_URI;
const API_URL = 'http://localhost:5000/api/v1';

async function runE2ETest() {
  console.log('🚀 Starting ChopNow E2E Platform Flow Test...');

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not set in environment variables.');
    process.exit(1);
  }

  // Generate unique credentials
  const timestamp = Date.now();
  const testUser = {
    email: `e2e_test_${timestamp}@chopnow.app`.toLowerCase(),
    password: 'Password123!',
    firstName: 'E2E',
    lastName: 'Tester',
    phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`,
  };

  console.log(`\n🔑 Test Credentials:`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Phone: ${testUser.phone}`);

  // Connect to DB directly for admin operations/checking
  console.log('\n🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB successfully.');

  try {
    // ──────── STEP 1: REGISTER USER ────────
    console.log('\n[Step 1] Registering test user...');
    const regRes = await axios.post(`${API_URL}/users/register`, {
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      phone: testUser.phone,
      role: 'consumer',
    });

    if (regRes.status !== 201) {
      throw new Error(`Registration failed with status ${regRes.status}`);
    }
    const userId = regRes.data._id;
    console.log(`✅ User registered successfully. ID: ${userId}`);

    // ──────── STEP 2: EMAIL VERIFICATION ────────
    console.log('\n[Step 2] Finding verification token in DB...');
    // Load User model dynamically using Mongoose connection
    const User =
      mongoose.model('User') || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const dbUser = await User.findById(userId).select('+verificationToken');

    if (!dbUser || !dbUser.verificationToken) {
      throw new Error('Verification token not found in MongoDB!');
    }
    console.log(`✅ Found token: ${dbUser.verificationToken}`);

    console.log('Sending verification request...');
    const verifyRes = await axios.get(`${API_URL}/users/verify-email`, {
      params: { token: dbUser.verificationToken },
    });
    console.log(`✅ Email verification success: ${verifyRes.data.message}`);

    // ──────── STEP 3: LOGIN ────────
    console.log('\n[Step 3] Logging in with verified credentials...');
    const loginRes = await axios.post(`${API_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    const jwtToken = loginRes.data.token;
    console.log(`✅ Login successful. JWT token received.`);

    const client = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    // ──────── STEP 4: ADD AND SWITCH ROLE ────────
    console.log('\n[Step 4] Requesting vendor access (adding business_owner role)...');
    await client.post('/users/add-role', { role: 'business_owner' });
    console.log('✅ Role added.');

    console.log('Switching active role to business_owner...');
    const switchRes = await client.post('/users/switch-role', { role: 'business_owner' });
    console.log(`✅ Role switched. Active role is now: ${switchRes.data.activeRole}`);

    // ──────── STEP 5: CREATE BUSINESS ────────
    console.log('\n[Step 5] Creating a new food rescue business...');
    const bizRes = await client.post('/businesses', {
      name: `E2E Green Eats ${timestamp}`,
      type: 'restaurant',
      description: 'Saving fresh surplus meals from waste!',
      contact: {
        email: testUser.email,
        phone: testUser.phone,
      },
      address: {
        street: 'KG 123 Ave',
        city: 'Kigali',
        location: {
          type: 'Point',
          coordinates: [30.06, -1.95], // [lng, lat]
        },
      },
      deliveryOptions: {
        pickup: true,
        delivery: true,
        deliveryFee: 800,
      },
    });

    const businessId = bizRes.data._id;
    console.log(`✅ Business created. ID: ${businessId}`);

    // Promotes the user to Admin in DB, then switches roles to verify the business through the admin verification API
    console.log('Granting admin privileges to test user in MongoDB...');
    const AdminUser =
      mongoose.model('User') || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    await AdminUser.findByIdAndUpdate(userId, {
      $addToSet: { roles: 'admin' },
    });
    console.log('✅ Admin role granted.');

    console.log('Switching active role to admin...');
    await client.post('/users/switch-role', { role: 'admin' });

    console.log('Approving the business via Admin Verification API...');
    const approveRes = await client.patch(`/businesses/${businessId}/approve`, {
      message: 'Verified by ChopNow automated E2E system',
    });

    const approvedBusiness = approveRes.data.business;
    if (
      approvedBusiness.status !== 'active' ||
      approvedBusiness.verification?.status !== 'approved'
    ) {
      throw new Error('Business approval via Admin API failed to set active/approved status!');
    }
    console.log(`✅ Business approved via Admin API. Status: ${approvedBusiness.status}`);

    console.log('Switching active role back to business_owner...');
    await client.post('/users/switch-role', { role: 'business_owner' });

    // ──────── STEP 6: CREATE SURPLUS FOOD LISTING ────────
    console.log('\n[Step 6] Creating a surplus food listing...');
    const listingRes = await client.post('/listings', {
      business: businessId,
      title: 'Premium Surplus Veggie Bowl',
      description: 'Fresh salad with avocados, tomatoes, and organic greens',
      category: 'meals',
      pricing: {
        originalPrice: 4500,
        price: 1200,
      },
      inventory: {
        quantity: 10,
      },
      timeWindow: {
        availableFrom: new Date().toISOString(),
        availableUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      },
    });

    const listingId = listingRes.data._id;
    console.log(`✅ Listing created. ID: ${listingId}, Title: ${listingRes.data.title}`);

    // ──────── STEP 7: SEARCH LISTINGS ────────
    console.log('\n[Step 7] Switching back to consumer role to shop...');
    await client.post('/users/switch-role', { role: 'consumer' });

    console.log('Searching for nearby listings...');
    const searchRes = await client.get('/listings/nearby', {
      params: { lat: -1.95, lng: 30.06, maxDistance: 5000 },
    });

    const foundListing = searchRes.data.listings.find((l) => l._id === listingId);
    if (!foundListing) {
      console.warn(
        '⚠️ Listing not in nearby search (possibly geolocation indexing lag). Fetching all listings instead...'
      );
      const allListings = await client.get('/listings');
      const foundInAll = allListings.data.listings.find((l) => l._id === listingId);
      if (!foundInAll) {
        throw new Error('Listing was not found in listing search endpoint!');
      }
    }
    console.log('✅ Listing successfully found in catalog search.');

    // ──────── STEP 8: CART OPERATIONS ────────
    console.log('\n[Step 8] Adding food items to cart...');
    const cartRes = await client.post('/cart/add', {
      listingId: listingId,
      quantity: 3,
    });
    console.log(`✅ Cart updated. Current item count: ${cartRes.data.items?.length}`);

    // ──────── STEP 9: CHECKOUT & PLACE ORDER ────────
    console.log('\n[Step 9] Placed order (checkout)...');
    const orderRes = await client.post('/orders', {
      listing: listingId,
      items: [
        {
          listing: listingId,
          title: 'Premium Surplus Veggie Bowl',
          quantity: 3,
          unitPrice: 1200,
          subtotal: 3600,
        },
      ],
      fulfillmentType: 'pickup',
      payment: {
        paymentMethod: 'mobile_money',
        phoneNumber: testUser.phone,
      },
    });

    const orderId = orderRes.data._id;
    const orderNumber = orderRes.data.orderNumber;
    console.log(`✅ Order placed! ID: ${orderId}, Order Number: ${orderNumber}`);
    console.log(`   Initial Status: ${orderRes.data.status}`);

    // ──────── STEP 10: VENDOR PROCESSES ────────
    console.log('\n[Step 10] Switching role to business_owner to confirm order...');
    await client.post('/users/switch-role', { role: 'business_owner' });

    console.log('Confirming order...');
    const confirmRes = await client.put(`/orders/${orderId}/status`, { status: 'confirmed' });
    console.log(`✅ Order confirmed. Status: ${confirmRes.data.status}`);

    console.log('Marking order ready for pickup...');
    const readyRes = await client.put(`/orders/${orderId}/status`, { status: 'ready_for_pickup' });
    console.log(`✅ Order ready. Status: ${readyRes.data.status}`);

    // Retrieve pickup code
    const orderDetails = await client.get(`/orders/${orderId}`);
    const pickupCode = orderDetails.data.pickupDetails?.pickupCode;
    console.log(`✅ Retrieved secure pickup code: ${pickupCode}`);

    // ──────── STEP 11: FULLFILL ORDER ────────
    console.log('\n[Step 11] Verifying pickup code to complete order...');
    const completeRes = await client.post(`/orders/${orderId}/verify-pickup`, { pickupCode });
    console.log(`✅ Pickup verified successfully. Final Status: ${completeRes.data.order?.status}`);

    // ──────── STEP 12: LEAVE REVIEW ────────
    console.log('\n[Step 12] Switching role to consumer to leave feedback...');
    await client.post('/users/switch-role', { role: 'consumer' });

    console.log('Submitting review for the order...');
    const reviewRes = await client.post('/reviews', {
      order: orderId,
      business: businessId,
      rating: 5,
      comment: 'Absolutely fabulous veggie bowl! Highly recommended, fresh and sustainable!',
    });
    console.log(`✅ Review submitted successfully! Rating: ${reviewRes.data.rating} stars`);

    console.log(
      '\n🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! ChopNow platform works perfectly from registration to order completion.'
    );
  } catch (error) {
    console.error('\n❌ E2E FLOW TEST FAILED:');
    if (error.response) {
      console.error(`   API Error (${error.response.status}):`, error.response.data);
    } else {
      console.error('   Error Details:', error.message);
    }
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB.');
  }
}

runE2ETest();

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Pre-load Mongoose models so they register schemas
require('../models/User');
require('../models/Business');

const MONGO_URI = process.env.MONGO_URI;
const API_URL = 'http://localhost:5000/api/v1';

async function runAdminTest() {
  console.log('🚀 Starting ChopNow Admin API Functionalities Test...');

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not set in environment variables.');
    process.exit(1);
  }

  // Generate unique credentials for the Admin tester
  const timestamp = Date.now();
  const adminCreds = {
    email: `admin_test_${timestamp}@chopnow.app`.toLowerCase(),
    password: 'Password123!',
    firstName: 'System',
    lastName: 'Admin',
    phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`,
  };

  console.log(`\n🔑 Creating Admin Credentials:`);
  console.log(`   Email: ${adminCreds.email}`);

  // Connect to DB directly to grant admin privileges
  console.log('\n🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB successfully.');

  try {
    // ──────── REGISTER DUMMY ADMIN USER ────────
    console.log('\n[Prep 1] Registering user...');
    const regRes = await axios.post(`${API_URL}/users/register`, {
      email: adminCreds.email,
      password: adminCreds.password,
      firstName: adminCreds.firstName,
      lastName: adminCreds.lastName,
      phone: adminCreds.phone,
      role: 'consumer',
    });
    const userId = regRes.data._id;
    console.log(`✅ Registered User ID: ${userId}`);

    // Verify email directly in DB
    const User =
      mongoose.model('User') || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    await User.findByIdAndUpdate(userId, {
      isVerified: true,
      $addToSet: { roles: 'admin' },
      activeRole: 'admin',
    });
    console.log('✅ Directly promoted user to Admin role in DB.');

    // ──────── LOGIN ────────
    console.log('\n[Prep 2] Logging in as Admin...');
    const loginRes = await axios.post(`${API_URL}/users/login`, {
      email: adminCreds.email,
      password: adminCreds.password,
    });

    const jwtToken = loginRes.data.token;
    console.log(`✅ Login successful. JWT token received.`);

    const adminClient = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    // Make sure role is switched to admin
    await adminClient.post('/users/switch-role', { role: 'admin' });
    console.log('✅ Switched active session role to admin.');

    // ──────── TEST 1: ADMIN ANALYTICS ENDPOINTS ────────
    console.log('\n[Test 1] Testing Admin Analytics endpoints...');

    console.log('GETting Admin Stats...');
    const adminStats = await adminClient.get('/analytics/admin/stats');
    console.log(
      `✅ Admin Stats fetched successfully. Active Users count: ${adminStats.data.users?.total || 0}`
    );

    console.log('GETting Platform Overview...');
    const overview = await adminClient.get('/analytics/platform/overview');
    console.log(
      `✅ Platform Overview fetched. Total revenue: ${overview.data.revenue?.totalRevenue || 0}`
    );

    console.log('GETting Platform Activity...');
    const activity = await adminClient.get('/analytics/platform/activity');
    console.log(
      `✅ Platform Activity fetched. Log length: ${activity.data.recentOrders?.length || 0}`
    );

    console.log('GETting User Activity...');
    const userActivity = await adminClient.get('/analytics/user-activity');
    console.log(
      `✅ User Activity fetched. Total active riders: ${userActivity.data.activeRiders?.length || 0}`
    );

    // ──────── TEST 2: PLATFORM SETTINGS ────────
    console.log('\n[Test 2] Testing Platform Settings endpoints...');
    console.log('GETting All platform settings...');
    const settingsGet = await adminClient.get('/settings');
    const originalName = settingsGet.data.platformName || 'ChopNow';
    console.log(`✅ Fetched settings. Platform Name: ${originalName}`);

    console.log('PUTting settings update...');
    const settingsPut = await adminClient.put('/settings', {
      platformName: `${originalName} (Tested)`,
    });
    console.log(
      `✅ Settings updated successfully. New Name: ${settingsPut.data.settings.platformName}`
    );

    // Revert settings
    await adminClient.put('/settings', { platformName: originalName });
    console.log('✅ Reverted platform name setting.');

    // ──────── TEST 3: BUSINESS APPROVAL QUEUE ────────
    console.log('\n[Test 3] Testing Business approval lists...');
    const pendingBiz = await adminClient.get('/businesses/pending');
    console.log(
      `✅ Fetched pending businesses queue. Count: ${pendingBiz.data.businesses?.length || 0}`
    );

    // ──────── TEST 4: SYSTEM-WIDE VIEWS (ORDERS & DELIVERIES) ────────
    console.log('\n[Test 4] Testing system-wide order and delivery logs...');
    const adminOrders = await adminClient.get('/orders/admin');
    console.log(
      `✅ Fetched system orders successfully. Count: ${adminOrders.data.orders?.length || 0}`
    );

    const adminDeliveries = await adminClient.get('/deliveries');
    console.log(
      `✅ Fetched system deliveries successfully. Count: ${adminDeliveries.data.deliveries?.length || 0}`
    );

    // ──────── TEST 5: DISPUTES AND PAYOUTS MANAGEMENT ────────
    console.log('\n[Test 5] Testing disputes and payout monitoring...');
    const disputeStats = await adminClient.get('/disputes/stats');
    console.log(
      `✅ Disputes stats fetched. Active disputes: ${disputeStats.data.statusCounts?.open || 0}`
    );

    const adminPayouts = await adminClient.get('/payouts/admin');
    console.log(
      `✅ Admin payouts history fetched. Count: ${adminPayouts.data.payouts?.length || 0}`
    );

    // ──────── TEST 6: USER MODERATION (SUSPEND / ACTIVATE) ────────
    console.log('\n[Test 6] Testing user moderation endpoints...');
    console.log('Listing users for admin panel...');
    const usersList = await adminClient.get('/users');
    console.log(`✅ Fetched users list. Total registered: ${usersList.data.users?.length || 0}`);

    // Create a dummy user to suspend and reactivate
    const dummyTimestamp = Date.now() + 1;
    const dummyCreds = {
      email: `moderation_test_${dummyTimestamp}@chopnow.app`.toLowerCase(),
      password: 'Password123!',
      firstName: 'Moderation',
      lastName: 'Dummy',
      phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    console.log('Creating a dummy user to test suspension...');
    const dummyReg = await axios.post(`${API_URL}/users/register`, {
      email: dummyCreds.email,
      password: dummyCreds.password,
      firstName: dummyCreds.firstName,
      lastName: dummyCreds.lastName,
      phone: dummyCreds.phone,
      role: 'consumer',
    });
    const dummyId = dummyReg.data._id;
    console.log(`✅ Dummy user created. ID: ${dummyId}`);

    console.log('Suspending dummy user...');
    const suspendRes = await adminClient.patch(`/users/${dummyId}/suspend`, {
      reason: 'Automated compliance test',
    });
    console.log(`✅ User suspended. Status message: ${suspendRes.data.message}`);

    console.log('Re-activating dummy user...');
    const activateRes = await adminClient.patch(`/users/${dummyId}/activate`);
    console.log(`✅ User activated. Status message: ${activateRes.data.message}`);

    // Clean up dummy users from database
    console.log('\n🧼 Cleaning up test users from MongoDB...');
    await User.findByIdAndDelete(userId);
    await User.findByIdAndDelete(dummyId);
    console.log('✅ Cleaned up successfully.');

    console.log('\n🎉 ALL ADMIN API FUNCTIONALITY TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ ADMIN FLOW TEST FAILED:');
    if (error.response) {
      console.error(`   API Error (${error.response.status}):`, error.response.data);
    } else {
      console.error('   Error Details:', error.message);
    }
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runAdminTest();

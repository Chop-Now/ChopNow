
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const axios = require('axios');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB connected');
  
  // Reset admin password
  const newPw = await bcrypt.hash('ChopAdmin123!', 12);
  const result = await User.updateOne(
    { email: 'ifegwuchibuezevictor@gmail.com' },
    { passwordHash: newPw, emailVerified: true }
  );
  console.log('Admin password reset:', result.modifiedCount, 'doc(s) updated');
  await mongoose.disconnect();
  
  // Verify login
  const r = await axios.post('http://localhost:5000/api/v1/users/login',
    { email: 'ifegwuchibuezevictor@gmail.com', password: 'ChopAdmin123!', role: 'admin' },
    { validateStatus: () => true }
  );
  console.log('Admin login test:', r.status, r.data && r.data.message || r.data && r.data.user && r.data.user.activeRole);
  
  // Check business validation error
  const aToken = r.data && r.data.token;
  if (aToken) {
    const biz = await axios.post('http://localhost:5000/api/v1/businesses', {
      name: 'Test Biz', description: 'desc', category: 'restaurant',
      address: { street: 'KN 5 Ave', city: 'Kigali', location: { type: 'Point', coordinates: [30.0588,-1.9441] }},
      contact: { phone: '+250788000001', email: 'vendor@test.com' }
    }, { headers: { Authorization: 'Bearer ' + aToken }, validateStatus: () => true });
    console.log('Business create (admin):', biz.status, JSON.stringify(biz.data).slice(0,300));
  }
}

run().catch(console.error);

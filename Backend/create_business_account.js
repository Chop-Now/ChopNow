const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Business = require('./models/Business');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    // Check if user exists
    let user = await User.findOne({ email: 'newbiz@test.com' });
    if (!user) {
      user = new User({
        email: 'newbiz@test.com',
        password: 'password123', // the pre-save hook will hash this
        firstName: 'New',
        lastName: 'Biz',
        role: 'business_owner',
        activeRole: 'business_owner',
        roles: ['business_owner']
      });
      await user.save();
      console.log('User created:', user._id);
    } else {
      console.log('User already exists:', user._id);
    }

    // Check if business exists
    let biz = await Business.findOne({ owner: user._id });
    if (!biz) {
      biz = new Business({
        name: 'The Awesome Business',
        owner: user._id,
        type: 'restaurant',
        email: 'newbiz@test.com',
        phone: '+250123456789',
        status: 'active',
        verification: { status: 'unverified' },
        address: {
          street: '123 Main St',
          city: 'Kigali',
          location: { type: 'Point', coordinates: [30.0619, -1.9403] }
        },
        location: { type: 'Point', coordinates: [30.0619, -1.9403] }
      });
      await biz.save();
      console.log('Business created:', biz._id);
    } else {
      console.log('Business already exists:', biz._id);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}).catch(console.error);

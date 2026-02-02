const mongoose = require('mongoose');
try {
    const User = require('./models/User');
    console.log('User model loaded successfully');
    const Business = require('./models/Business');
    console.log('Business model loaded successfully');
    const Product = require('./models/Product');
    console.log('Product model loaded successfully');
} catch (error) {
    console.error('Error loading models:', error);
}

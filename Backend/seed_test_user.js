const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'test@chopnow.app';
        const password = 'password123';
        const role = 'consumer'; // Buyer

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Test user already exists');
            // Reset password just in case
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
            user.emailVerified = true;
            await user.save();
            console.log('Test user password reset to: password123');
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            user = await User.create({
                email,
                passwordHash,
                firstName: 'Test',
                lastName: 'User',
                role,
                phone: '+1234567890',
                emailVerified: true
            });
            console.log('Test user created:', user.email);
        }

        process.exit(0);
    } catch (error) {
        console.error('Seed Parsing Error:', error);
        process.exit(1);
    }
};

seedUser();

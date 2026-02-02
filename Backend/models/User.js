const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    label: {
        type: String,
        trim: true
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { _id: true });

// Add geospatial index on location
addressSchema.index({ location: '2dsphere' });

const userSchema = new Schema({
    // Authentication
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required']
    },

    // Role
    role: {
        type: String,
        enum: ['consumer', 'business_owner', 'rider', 'admin'],
        required: [true, 'Role is required']
    },

    // Profile
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        trim: true
    },

    // Addresses
    addresses: [addressSchema],

    // Preferences
    preferences: {
        language: {
            type: String,
            default: 'en'
        },
        searchRadius: {
            type: Number,
            default: 5 // kilometers
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            newDealsNearby: {
                type: Boolean,
                default: true
            }
        }
    },

    // Email verification
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpires: {
        type: Date,
        default: null
    },

    // Password reset
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },

    // OTP for email login
    otpCode: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    },

    // Stats
    stats: {
        ordersCount: {
            type: Number,
            default: 0,
            min: 0
        },
        totalSpent: {
            type: Number,
            default: 0,
            min: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
userSchema.index({ 'addresses.location': '2dsphere' });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

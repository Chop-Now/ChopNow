const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['restaurant', 'bakery', 'supermarket', 'cafe', 'other'],
        default: 'restaurant'
    },

    // Contact Info
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },

    // Location
    address: {
        type: Schema.Types.Mixed, // Can be string or object
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },

    // Verification
    verification: {
        status: {
            type: String,
            enum: ['unverified', 'pending', 'approved', 'rejected'],
            default: 'unverified'
        },
        documents: [{
            type: {
                type: String, // license, health_cert, id_card
                default: 'other'
            },
            url: {
                type: String
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        submittedAt: Date,
        verifiedAt: Date,
        notes: String
    },

    // Operation
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },

    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },

    metrics: {
        mealsSaved: {
            type: Number,
            default: 0
        },
        co2Saved: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
businessSchema.index({ location: '2dsphere' });
businessSchema.index({ name: 'text', description: 'text' });

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;

const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['fruit-veg', 'baked-goods', 'meals', 'dairy', 'meat', 'beverages', 'pantry', 'other']
        // categories from assets.js: 'Fruits & Veg', 'Baked Goods', 'Prepared Meals', 'Dairy & Eggs', 'Meat & Seafood', 'Beverages', 'Pantry', 'Other'
        // Simplified enums or allow string? Ideally strict but let's allow string for now matching frontend values if possible or map them.
        // Frontend values: category.path which seem to be slug-like?
    },
    images: [{
        type: String
    }],
    pricing: {
        price: {
            type: Number,
            required: true
        },
        originalPrice: {
            type: Number
        },
        currency: {
            type: String,
            default: 'RWF'
        }
    },
    inventory: {
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        reserved: {
            type: Number,
            default: 0
        },
        unit: {
            type: String,
            default: 'item'
        }
    },
    timeWindow: {
        availableFrom: {
            type: Date,
            required: true
        },
        availableUntil: {
            type: Date,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'sold_out', 'expired', 'deleted'],
        default: 'active'
    },
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
        allergens: [String]
    },
    fulfillment: { // Added to match controller
        type: String,
        enum: ['pickup', 'delivery'],
        default: 'pickup'
    },
    views: {
        type: Number,
        default: 0
    },
    // Statistics
    stats: {
        views: { type: Number, default: 0 },
        orders: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Virtual for photos (alias for images)
listingSchema.virtual('photos').get(function() {
    return this.images;
}).set(function(value) {
    this.images = value;
});

// Methods
listingSchema.methods.isAvailable = function () {
    return this.status === 'active' && this.inventory.quantity > 0;
};

listingSchema.methods.reserveQuantity = async function (qty) {
    if (this.inventory.quantity < qty) {
        throw new Error('Not enough stock available');
    }
    this.inventory.quantity -= qty;
    this.inventory.reserved += qty;
    if (this.inventory.quantity === 0) {
        this.status = 'sold_out';
    }
    return this.save();
};

// Indexes
listingSchema.index({ business: 1, status: 1 });
listingSchema.index({ 'timeWindow.availableFrom': 1, 'timeWindow.availableUntil': 1 }); // For expiry queries
listingSchema.index({ location: '2dsphere' }); // If we add location to listing (usually business location used)

module.exports = mongoose.model('Listing', listingSchema);

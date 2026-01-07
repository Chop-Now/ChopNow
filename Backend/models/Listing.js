const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  
  // Business
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business reference is required']
  },
  
  // Category
  category: {
    type: String,
    enum: ['ready_meals', 'baked_goods', 'produce', 'dairy', 'meat_seafood', 'beverages', 'desserts', 'other'],
    required: [true, 'Category is required']
  },
  
  // Photos
  photos: [{
    type: String,
    trim: true
  }],
  
  // Pricing
  pricing: {
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price cannot be negative']
    },
    rescuePrice: {
      type: Number,
      required: [true, 'Rescue price is required'],
      min: [0, 'Rescue price cannot be negative']
    },
    currency: {
      type: String,
      default: 'RWF'
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Inventory
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    quantityAvailable: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Available quantity cannot be negative']
    },
    quantityReserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    }
  },
  
  // Time Window
  timeWindow: {
    availableFrom: {
      type: Date,
      required: [true, 'Available from date is required']
    },
    availableUntil: {
      type: Date,
      required: [true, 'Available until date is required']
    }
  },
  
  // Fulfillment Options
  fulfillment: {
    pickupEnabled: {
      type: Boolean,
      default: true
    },
    deliveryEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'sold_out', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Stats
  stats: {
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    orders: {
      type: Number,
      default: 0,
      min: 0
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
listingSchema.index({ business: 1, status: 1 });
listingSchema.index({ status: 1, 'timeWindow.availableUntil': 1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ title: 'text', description: 'text' });

// Calculate discount percentage before saving
listingSchema.pre('save', function(next) {
  if (this.pricing.originalPrice && this.pricing.rescuePrice) {
    this.pricing.discountPercentage = Math.round(
      ((this.pricing.originalPrice - this.pricing.rescuePrice) / this.pricing.originalPrice) * 100
    );
  }
  
  // Validate time window
  if (this.timeWindow.availableFrom >= this.timeWindow.availableUntil) {
    return next(new Error('availableFrom must be before availableUntil'));
  }
  
  // Validate inventory
  if (this.inventory.quantityAvailable > this.inventory.quantity) {
    return next(new Error('Available quantity cannot exceed total quantity'));
  }
  
  next();
});

// Method to check if listing is still available
listingSchema.methods.isAvailable = function() {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.inventory.quantityAvailable > 0 &&
    this.timeWindow.availableFrom <= now &&
    this.timeWindow.availableUntil > now
  );
};

// Method to reserve quantity
listingSchema.methods.reserveQuantity = async function(quantity) {
  if (this.inventory.quantityAvailable < quantity) {
    throw new Error('Insufficient quantity available');
  }
  
  this.inventory.quantityAvailable -= quantity;
  this.inventory.quantityReserved += quantity;
  
  if (this.inventory.quantityAvailable === 0) {
    this.status = 'sold_out';
  }
  
  return this.save();
};

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['restaurant', 'bakery', 'supermarket', 'grocery', 'cafe', 'other'],
    required: [true, 'Business type is required']
  },
  description: {
    type: String,
    trim: true
  },
  
  // Owner
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Business owner is required']
  },
  
  // Contact
  contact: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    }
  },
  
  // Address
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
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
    instructions: {
      type: String,
      trim: true
    }
  },
  
  // Media
  media: {
    logo: {
      type: String,
      trim: true
    },
    coverImage: {
      type: String,
      trim: true
    },
    photos: [{
      type: String,
      trim: true
    }]
  },
  
  // Delivery Settings
  deliverySettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    radius: {
      type: Number,
      default: 5, // kilometers
      min: 0
    },
    fee: {
      type: Number,
      default: 0,
      min: 0
    },
    minimumOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedTime: {
      type: Number,
      default: 30, // minutes
      min: 0
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  
  // Stats
  stats: {
    totalListings: {
      type: Number,
      default: 0,
      min: 0
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
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
businessSchema.index({ 'address.location': '2dsphere' });
businessSchema.index({ name: 'text', description: 'text' });
businessSchema.index({ status: 1, 'address.location': '2dsphere' });

// Ensure location coordinates are [longitude, latitude]
businessSchema.pre('save', function(next) {
  if (this.address && this.address.location && this.address.location.coordinates) {
    const [lng, lat] = this.address.location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return next(new Error('Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'));
    }
  }
  next();
});

const Business = mongoose.model('Business', businessSchema);

module.exports = Business;

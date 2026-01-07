const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  }
}, { _id: true });

const orderSchema = new Schema({
  // Order Number
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  
  // References
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business is required']
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: 'Listing',
    required: [true, 'Listing is required']
  },
  
  // Items
  items: [orderItemSchema],
  
  // Pricing
  pricing: {
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      default: 'RWF'
    }
  },
  
  // Fulfillment Type
  fulfillmentType: {
    type: String,
    enum: ['pickup', 'delivery'],
    required: [true, 'Fulfillment type is required']
  },
  
  // Pickup Details
  pickupDetails: {
    pickupCode: {
      type: String,
      trim: true
    },
    pickupInstructions: {
      type: String,
      trim: true
    },
    pickedUpAt: {
      type: Date
    }
  },
  
  // Delivery Details
  deliveryDetails: {
    address: {
      street: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number]
        }
      }
    },
    recipientName: {
      type: String,
      trim: true
    },
    recipientPhone: {
      type: String,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    },
    estimatedDeliveryTime: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  },
  
  // Delivery Reference
  delivery: {
    type: Schema.Types.ObjectId,
    ref: 'Delivery'
  },
  
  // Status
  status: {
    type: String,
    enum: [
      'pending_payment',
      'paid',
      'confirmed',
      'ready_for_pickup',
      'out_for_delivery',
      'completed',
      'cancelled'
    ],
    default: 'pending_payment'
  },
  
  // Payment
  payment: {
    paymentMethod: {
      type: String,
      enum: ['card', 'mobile_money', 'cash']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  
  // Timestamps for status changes
  statusTimestamps: {
    paidAt: {
      type: Date
    },
    confirmedAt: {
      type: Date
    },
    readyAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    }
  },
  
  // Notes
  notes: {
    customerNotes: {
      type: String,
      trim: true
    },
    businessNotes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ customer: 1, status: 1, createdAt: -1 });
orderSchema.index({ business: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    // Generate order number: ORD-YYYYMMDD-RANDOM
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${dateStr}-${random}`;
  }
  
  // Calculate total
  if (this.pricing.subtotal !== undefined && this.pricing.deliveryFee !== undefined) {
    this.pricing.total = this.pricing.subtotal + this.pricing.deliveryFee;
  }
  
  next();
});

// Method to update order status with timestamp
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  const statusTimestampMap = {
    'paid': 'paidAt',
    'confirmed': 'confirmedAt',
    'ready_for_pickup': 'readyAt',
    'completed': 'completedAt',
    'cancelled': 'cancelledAt'
  };
  
  const timestampField = statusTimestampMap[newStatus];
  if (timestampField) {
    this.statusTimestamps[timestampField] = new Date();
  }
  
  return this.save();
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending_payment', 'paid', 'confirmed'];
  return cancellableStatuses.includes(this.status);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

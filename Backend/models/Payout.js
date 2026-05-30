const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payoutSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'RWF',
    },
    status: {
      type: String,
      enum: ['requested', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'requested',
    },
    method: {
      type: String,
      enum: ['bank', 'mobile'],
      required: true,
    },
    reference: {
      type: String,
      unique: true,
      sparse: true,
    },
    bankReference: String,
    failureReason: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

payoutSchema.pre('validate', function (next) {
  if (!this.business && !this.user) {
    this.invalidate('business', 'Either business or user reference is required');
  }
  next();
});

// Indexes for query optimization
payoutSchema.index({ business: 1, status: 1, createdAt: -1 }); // Business payouts history
payoutSchema.index({ user: 1, status: 1, createdAt: -1 }); // User payouts history
payoutSchema.index({ status: 1, createdAt: -1 }); // Processing queue
payoutSchema.index({ processedBy: 1, processedAt: -1 }, { sparse: true }); // Admin processing history
payoutSchema.index({ method: 1, status: 1 }); // Payouts by method
payoutSchema.index({ amount: -1, status: 1 }); // High-value payouts tracking

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;

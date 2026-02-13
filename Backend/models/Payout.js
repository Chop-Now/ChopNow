const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payoutSchema = new Schema({
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'RWF'
    },
    status: {
        type: String,
        enum: ['requested', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'requested'
    },
    method: {
        type: String,
        enum: ['bank', 'mobile'],
        required: true
    },
    reference: {
        type: String,
        unique: true,
        sparse: true
    },
    bankReference: String,
    failureReason: String,
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: Date
}, {
    timestamps: true
});

// Indexes for query optimization
payoutSchema.index({ business: 1, status: 1, createdAt: -1 });           // Business payouts history
payoutSchema.index({ status: 1, createdAt: -1 });                        // Processing queue
payoutSchema.index({ processedBy: 1, processedAt: -1 }, { sparse: true }); // Admin processing history
payoutSchema.index({ method: 1, status: 1 });                            // Payouts by method
payoutSchema.index({ 'amount': -1, status: 1 });                         // High-value payouts tracking

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;

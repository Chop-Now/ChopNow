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
        type: {
            type: String,
            enum: ['bank', 'mobile_money'],
            required: true
        },
        details: {
            // Bank details
            bankName: String,
            accountName: String,
            accountNumber: String,
            swiftCode: String,
            // Mobile money details
            provider: String,
            phoneNumber: String
        }
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

// Indexes
payoutSchema.index({ business: 1, status: 1 });
payoutSchema.index({ status: 1 });

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;

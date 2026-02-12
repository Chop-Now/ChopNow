const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const disputeSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    business: {
        type: Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    type: {
        type: String,
        enum: ['refund', 'missing_item', 'vendor_unresponsive', 'delivery_issue', 'poor_quality', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    evidence: [{
        type: String, // URLs to photos
        trim: true
    }],
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved', 'rejected', 'escalated'],
        default: 'open'
    },
    resolution: {
        action: {
            type: String,
            enum: ['full_refund', 'partial_refund', 'replacement', 'rejected', 'none']
        },
        amount: Number,
        comment: String,
        resolvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: Date
    },
    timeline: [{
        event: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
disputeSchema.index({ status: 1 });
disputeSchema.index({ priority: 1 });
disputeSchema.index({ business: 1 });
disputeSchema.index({ customer: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;

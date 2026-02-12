const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const csrDisbursementSchema = new Schema({
    ngo: {
        type: Schema.Types.ObjectId,
        ref: 'NGO',
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
    purpose: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['planned', 'processing', 'completed', 'failed'],
        default: 'planned'
    },
    reference: String,
    disbursedAt: Date,
    impactReport: {
        summary: String,
        beneficiariesCount: Number,
        photos: [String]
    }
}, {
    timestamps: true
});

const CSRDisbursement = mongoose.model('CSRDisbursement', csrDisbursementSchema);

module.exports = CSRDisbursement;

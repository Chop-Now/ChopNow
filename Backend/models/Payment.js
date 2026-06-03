const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    depositId: {
      type: String,
      required: [true, 'Deposit ID is required'],
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    currency: {
      type: String,
      default: 'RWF',
    },
    payerPhoneNumber: {
      type: String,
      required: [true, 'Payer phone number is required'],
    },
    correspondent: {
      type: String,
      required: [true, 'Correspondent (provider) is required'],
      enum: ['MTN_MOMO_RWA', 'AIRTEL_RWA'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    providerTransactionId: {
      type: String,
      trim: true,
    },
    failureReason: {
      code: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },
    callbackReceived: {
      type: Boolean,
      default: false,
    },
    rawCallbackData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);

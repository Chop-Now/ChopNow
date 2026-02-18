const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ngoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    focusArea: [
      {
        type: String,
        enum: ['food_security', 'environment', 'education', 'health', 'other'],
      },
    ],
    website: String,
    logo: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    stats: {
      totalReceived: {
        type: Number,
        default: 0,
      },
      projectsFunded: {
        type: Number,
        default: 0,
      },
    },
    contact: {
      email: String,
      phone: String,
      address: String,
    },
  },
  {
    timestamps: true,
  }
);

const NGO = mongoose.model('NGO', ngoSchema);

module.exports = NGO;

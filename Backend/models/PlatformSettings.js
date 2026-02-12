const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  // General Settings
  platformName: {
    type: String,
    default: 'ChopNow'
  },
  platformTagline: {
    type: String,
    default: 'Save Food, Save Money, Save the Planet'
  },
  supportEmail: {
    type: String,
    default: 'support@chopnow.com'
  },
  supportPhone: {
    type: String,
    default: '+250 788 000 000'
  },

  // Commission & Payout Settings
  platformFeePercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  minimumWithdrawal: {
    type: Number,
    default: 5000 // RWF
  },
  payoutSchedule: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    default: 'biweekly'
  },

  // Feature Toggles
  allowNewRegistrations: {
    type: Boolean,
    default: true
  },
  requireEmailVerification: {
    type: Boolean,
    default: true
  },
  allowGuestCheckout: {
    type: Boolean,
    default: false
  },
  enableReviews: {
    type: Boolean,
    default: true
  },
  enableNotifications: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },

  // Admin Notification Settings
  sendOrderConfirmation: {
    type: Boolean,
    default: true
  },
  sendPayoutNotification: {
    type: Boolean,
    default: true
  },
  sendNewVendorAlert: {
    type: Boolean,
    default: true
  },
  sendWeeklyReport: {
    type: Boolean,
    default: true
  },

  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists (singleton pattern)
platformSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

platformSettingsSchema.statics.updateSettings = async function(updates, adminId) {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this({});
  }

  // Update allowed fields only
  const allowedFields = [
    'platformName', 'platformTagline', 'supportEmail', 'supportPhone',
    'platformFeePercent', 'minimumWithdrawal', 'payoutSchedule',
    'allowNewRegistrations', 'requireEmailVerification', 'allowGuestCheckout',
    'enableReviews', 'enableNotifications', 'maintenanceMode',
    'sendOrderConfirmation', 'sendPayoutNotification', 'sendNewVendorAlert', 'sendWeeklyReport'
  ];

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      settings[field] = updates[field];
    }
  });

  settings.lastUpdatedBy = adminId;
  settings.updatedAt = new Date();

  await settings.save();
  return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);

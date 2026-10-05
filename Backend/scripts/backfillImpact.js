/* eslint-disable no-console */
/**
 * Gives completed orders an estimated environmental impact and rebuilds every
 * vendor's and customer's impact totals from them. The server runs the same
 * backfill automatically at startup, so this is only needed to run it by hand.
 * Orders that already have impact are left alone, so it is safe to repeat.
 * Usage: node scripts/backfillImpact.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { backfillOrderImpact } = require('../services/impactService');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const result = await backfillOrderImpact();
    console.log('Done:', result);
  } catch (err) {
    console.error('Backfill failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();

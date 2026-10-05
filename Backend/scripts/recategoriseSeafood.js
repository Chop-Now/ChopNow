/* eslint-disable no-console */
/**
 * Moves fish and seafood listings from the "meat" category to "seafood".
 * Shows what it would do and changes nothing unless you pass --apply.
 *
 * Usage:
 *   node scripts/recategoriseSeafood.js           - preview only
 *   node scripts/recategoriseSeafood.js --apply   - make the change
 *
 * Only listing titles decide (see services/seafoodRecategoriser.js). Listings
 * that need a human look are printed under "Needs review" and never changed.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { recategoriseSeafood } = require('../services/seafoodRecategoriser');

(async () => {
  const apply = process.argv.includes('--apply');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    const { moved, review } = await recategoriseSeafood({ apply });

    console.log(`\n${apply ? 'Moved to seafood' : 'Would move to seafood'} (${moved.length}):`);
    moved.forEach((l) => console.log(`  ${l._id}  ${l.title}  [${l.status}]`));
    console.log(`\nNeeds review - not changed (${review.length}):`);
    review.forEach((l) => console.log(`  ${l._id}  ${l.title}  [${l.status}]`));
    if (!apply && moved.length > 0) console.log('\nRun again with --apply to make the change.');
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();

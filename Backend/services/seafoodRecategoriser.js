/**
 * One-off clean-up: fish and seafood used to be listed under "meat" (the old
 * "Meat & Seafood" category). Seafood now has its own category and impact
 * factors, so listings that are clearly fish move across.
 *
 * Only the TITLE decides. A title that names a fish or shellfish and no
 * land-meat moves automatically; a title naming both ("Chicken and fish
 * combo") or a fish word only in the description is returned for a person to
 * look at and is never changed here.
 *
 * Orders already completed keep the category and impact they were completed
 * with; this only affects listings from now on.
 */
const Listing = require('../models/Listing');

const SEAFOOD_WORDS = [
  'fish',
  'seafood',
  'tilapia',
  'salmon',
  'tuna',
  'sardines?',
  'mackerel',
  'catfish',
  'nile perch',
  'perch',
  'trout',
  'cod',
  'haddock',
  'snapper',
  'sea bass',
  'anchov(?:y|ies)',
  'herring',
  'sambaza',
  'isambaza',
  'dagaa',
  'omena',
  'prawns?',
  'shrimps?',
  'crabs?',
  'lobsters?',
  'squid',
  'calamari',
  'octopus',
  'oysters?',
  'mussels?',
  'clams?',
  'scallops?',
];

const LAND_MEAT_WORDS = [
  'chicken',
  'beef',
  'goat',
  'pork',
  'lamb',
  'mutton',
  'turkey',
  'duck',
  'sausages?',
  'bacon',
  'ham',
  'steak',
  'ribs?',
  'liver',
  'brochettes?',
];

const wordRegex = (words) => new RegExp(`\\b(?:${words.join('|')})\\b`, 'i');
const SEAFOOD_RE = wordRegex(SEAFOOD_WORDS);
const LAND_MEAT_RE = wordRegex(LAND_MEAT_WORDS);

/** @returns {'move'|'review'|'leave'} what to do with a listing in the meat category */
function classifyListing({ title, description }) {
  const inTitle = typeof title === 'string' && SEAFOOD_RE.test(title);
  if (inTitle) {
    return LAND_MEAT_RE.test(title) ? 'review' : 'move';
  }
  const inDescription = typeof description === 'string' && SEAFOOD_RE.test(description);
  return inDescription ? 'review' : 'leave';
}

/**
 * Finds fish listings still filed under meat and (with apply: true) moves the
 * clear ones to seafood. Read-only by default.
 * @returns {Promise<{moved: object[], review: object[], applied: boolean}>}
 */
async function recategoriseSeafood({ apply = false } = {}) {
  const listings = await Listing.find({ category: 'meat' })
    .select('title description business status')
    .lean();

  const moved = [];
  const review = [];
  for (const listing of listings) {
    const verdict = classifyListing(listing);
    const row = { _id: listing._id, title: listing.title, status: listing.status };
    if (verdict === 'move') moved.push(row);
    else if (verdict === 'review') review.push(row);
  }

  if (apply && moved.length > 0) {
    await Listing.updateMany(
      { _id: { $in: moved.map((l) => l._id) }, category: 'meat' },
      { $set: { category: 'seafood' } }
    );
  }
  return { moved, review, applied: apply };
}

module.exports = { classifyListing, recategoriseSeafood };

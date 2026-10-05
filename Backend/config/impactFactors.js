/**
 * Environmental impact estimates for rescued food.
 *
 * This is an ESTIMATE, not a measurement. For every order item we work out how
 * many kilograms of food were rescued, then multiply by a per-category factor
 * for the greenhouse gas emissions and the water that went into producing it
 * (the resources that are wasted when the food is thrown away).
 *
 *   kg of food  = quantity x weight of one item
 *   CO2e saved  = kg x CATEGORY.co2ePerKg
 *   water saved = kg x CATEGORY.waterPerKg
 *
 * Weight of one item comes from, in order of trust:
 *   1. the listing's unit when the vendor sells by weight/volume (kg, g, l, ml)
 *   2. a weight or volume written in the listing title ("Avocados 1kg",
 *      "Yoghurt 500ml x4") - so vendors never have to enter anything extra
 *   3. a typical weight for the category (defaultWeightKg)
 *
 * The factors are deliberately toward the LOW end of published ranges, so that
 * anything we publish is more likely under- than over-stated. Emissions cover
 * production up to the shop (farm, processing, transport, packaging); the
 * avoided methane from landfill and consumer-stage emissions are NOT counted.
 *
 * Sources (rounded; review before quoting in print):
 *  - Poore & Nemecek (2018), "Reducing food's environmental impacts through
 *    producers and consumers", Science 360 - via Our World in Data,
 *    "Environmental impacts of food" (kg CO2e per kg, global medians)
 *  - Mekonnen & Hoekstra (2011/2012), "The green, blue and grey water footprint
 *    of crops and derived crop products" / "...of farm animals and animal
 *    products", Water Footprint Network (litres per kg)
 *  - WRAP, "Food surplus and waste in the UK - key facts" (cross-check on the
 *    order of magnitude of embodied emissions in wasted food)
 *
 * Change a number here and the whole platform follows; bump FACTORS_VERSION so
 * stored orders record which table produced them.
 */

const FACTORS_VERSION = '2026-10-v1';

// Keys match the Listing.category enum.
const CATEGORY_FACTORS = {
  meat: {
    label: 'Meat & Seafood',
    defaultWeightKg: 0.4,
    co2ePerKg: 10, // poultry ~6, pork ~7, farmed fish ~13, beef ~60 - mixed, beef-light
    waterPerKg: 4500,
  },
  dairy: {
    label: 'Dairy & Eggs',
    defaultWeightKg: 0.4,
    co2ePerKg: 4, // milk ~3, eggs ~4.5, cheese ~21 - mostly milk, yoghurt, eggs
    waterPerKg: 1200,
  },
  meals: {
    label: 'Prepared Meals',
    defaultWeightKg: 0.45,
    co2ePerKg: 3, // typical mixed cooked meal (grains, legumes, veg, some meat)
    waterPerKg: 1500,
  },
  'baked-goods': {
    label: 'Baked Goods',
    defaultWeightKg: 0.3,
    co2ePerKg: 1.4, // bread / wheat products ~1.4
    waterPerKg: 1500,
  },
  'fruit-veg': {
    label: 'Fruits & Veg',
    defaultWeightKg: 0.8,
    co2ePerKg: 0.6, // vegetables ~0.4-2, most fruit ~0.4-1
    waterPerKg: 500,
  },
  pantry: {
    label: 'Pantry',
    defaultWeightKg: 0.5,
    co2ePerKg: 2, // rice ~4.5, wheat/maize ~1.4-1.7, oils/sugar ~2-3.5
    waterPerKg: 1800,
  },
  beverages: {
    label: 'Beverages',
    defaultWeightKg: 0.5,
    co2ePerKg: 0.8, // per litre; soft drinks/juice ~0.3-1
    waterPerKg: 400,
  },
  other: {
    label: 'Other',
    defaultWeightKg: 0.4,
    co2ePerKg: 2.5, // below the mean of the categories above, on purpose
    waterPerKg: 1200,
  },
};

const FALLBACK_CATEGORY = 'other';

// A single item outside this range is almost certainly a mis-read title.
const MIN_ITEM_KG = 0.05;
const MAX_ITEM_KG = 25;

const UNIT_TO_KG = {
  kg: 1,
  kgs: 1,
  kilo: 1,
  kilos: 1,
  kilogram: 1,
  kilograms: 1,
  g: 0.001,
  gm: 0.001,
  gms: 0.001,
  gr: 0.001,
  gram: 0.001,
  grams: 0.001,
  // Volume: 1 litre is treated as 1 kg (true for water-based drinks and dairy).
  l: 1,
  lt: 1,
  ltr: 1,
  litre: 1,
  litres: 1,
  liter: 1,
  liters: 1,
  ml: 0.001,
  cl: 0.01,
};

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const round = (value, digits) => {
  const f = 10 ** digits;
  return Math.round((value + Number.EPSILON) * f) / f;
};

const isValidWeight = (kg) => Number.isFinite(kg) && kg >= MIN_ITEM_KG && kg <= MAX_ITEM_KG;

/**
 * Reads a total weight (kg) out of free text such as "Fresh Avocados 1kg",
 * "Mandazi 12 pieces 500g", "Yoghurt 500ml x4" or "4 x 250g".
 * Several amounts in one title ("Rice 1kg + Juice 500ml") are added up.
 * Returns null when nothing sensible is found.
 */
function parseWeightKg(text) {
  if (typeof text !== 'string' || !text) return null;

  // [multiplier x] amount unit [x multiplier]
  const pattern =
    /(?:(\d{1,3})\s*[x×]\s*)?(\d+(?:[.,]\d+)?)\s*(kgs?|kilos?|kilograms?|grams?|gms?|gr|g|ml|cl|litres?|liters?|ltr|lt|l)\b(?:\s*[x×]\s*(\d{1,3})\b)?/gi;

  let total = 0;
  let matched = false;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const amount = parseFloat(match[2].replace(',', '.'));
    const unitKey = match[3].toLowerCase();
    if (!Number.isFinite(amount) || !has(UNIT_TO_KG, unitKey)) continue;
    const factor = UNIT_TO_KG[unitKey];
    const multiplier = Number(match[1] || 1) * Number(match[4] || 1);
    total += amount * factor * Math.max(1, multiplier);
    matched = true;
  }

  if (!matched) return null;
  return isValidWeight(total) ? total : null;
}

/** Weight of ONE unit when a vendor sells by weight or volume (inventory.unit). */
function unitWeightKg(unit) {
  if (typeof unit !== 'string') return null;
  const key = unit.trim().toLowerCase();
  return has(UNIT_TO_KG, key) ? UNIT_TO_KG[key] : null;
}

function resolveCategory(category) {
  return typeof category === 'string' && has(CATEGORY_FACTORS, category)
    ? category
    : FALLBACK_CATEGORY;
}

/**
 * Impact of one order line.
 * @param {{quantity?: number, title?: string}} item
 * @param {{category?: string, unit?: string}} [listing]
 * @returns {{category: string, basis: 'unit'|'title'|'default', unitKg: number,
 *            quantity: number, kg: number, co2e: number, water: number}}
 */
function impactForItem(item, listing = {}) {
  const quantity = Math.max(1, Number(item?.quantity) || 1);
  const category = resolveCategory(listing?.category);
  const factors = CATEGORY_FACTORS[category];

  let basis = 'default';
  let unitKg = factors.defaultWeightKg;

  const fromUnit = unitWeightKg(listing?.unit);
  if (fromUnit !== null) {
    // Sold by the kilo/litre/gram: each unit of quantity IS that weight.
    unitKg = fromUnit;
    basis = 'unit';
  } else {
    const fromTitle = parseWeightKg(item?.title);
    if (fromTitle !== null) {
      unitKg = fromTitle;
      basis = 'title';
    }
  }

  const kg = quantity * unitKg;
  return {
    category,
    basis,
    unitKg: round(unitKg, 4),
    quantity,
    kg: round(kg, 4),
    co2e: round(kg * factors.co2ePerKg, 4),
    water: round(kg * factors.waterPerKg, 2),
  };
}

/**
 * Impact of a whole order.
 * @param {Array<{listing?: any, quantity?: number, title?: string}>} items
 * @param {Map<string, {category?: string, unit?: string}>} listingsById keyed by String(listing id)
 * @returns {{items: Array, totals: {meals: number, kg: number, co2e: number, water: number}}}
 */
function impactForItems(items, listingsById = new Map()) {
  const lines = (items || []).map((item) => {
    const key = String(item?.listing?._id || item?.listing || '');
    return impactForItem(item, listingsById.get(key));
  });
  const totals = lines.reduce(
    (acc, line) => ({
      meals: acc.meals + line.quantity,
      kg: acc.kg + line.kg,
      co2e: acc.co2e + line.co2e,
      water: acc.water + line.water,
    }),
    { meals: 0, kg: 0, co2e: 0, water: 0 }
  );
  return {
    items: lines,
    totals: {
      meals: totals.meals,
      kg: round(totals.kg, 4),
      co2e: round(totals.co2e, 4),
      water: round(totals.water, 2),
    },
  };
}

/** Public, display-ready description of the method, for the "How we calculate this" page. */
function methodology() {
  return {
    version: FACTORS_VERSION,
    categories: Object.entries(CATEGORY_FACTORS).map(([key, f]) => ({
      key,
      label: f.label,
      defaultWeightKg: f.defaultWeightKg,
      co2ePerKg: f.co2ePerKg,
      waterPerKg: f.waterPerKg,
    })),
    sources: [
      {
        name: 'Poore & Nemecek (2018), Reducing food’s environmental impacts through producers and consumers, Science 360',
        use: 'greenhouse gas emissions per kg of food (via Our World in Data)',
      },
      {
        name: 'Mekonnen & Hoekstra (2011, 2012), Water footprint of crops and of farm animals and animal products, Water Footprint Network',
        use: 'litres of water per kg of food',
      },
      {
        name: 'WRAP, Food surplus and waste in the UK – key facts',
        use: 'cross-check on the scale of emissions embedded in wasted food',
      },
    ],
  };
}

module.exports = {
  FACTORS_VERSION,
  CATEGORY_FACTORS,
  MIN_ITEM_KG,
  MAX_ITEM_KG,
  parseWeightKg,
  unitWeightKg,
  impactForItem,
  impactForItems,
  methodology,
};

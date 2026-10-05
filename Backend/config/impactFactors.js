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
 * Sources (checked against the published data on 2026-10-05):
 *  - Poore & Nemecek (2018), Science 360, as published by Our World in Data
 *    (grapher "ghg-per-kg-poore", global means in kg CO2e per kg of product)
 *  - Mekonnen & Hoekstra (2012) farm animal products and (2011) crops, as
 *    published by Our World in Data (m3 per tonne = litres per kg)
 *  - WRAP, "Household food and drink waste in the UK 2022": about 16 Mt CO2e
 *    for 6.0 Mt of food and drink wasted, i.e. roughly 2.7 kg CO2e per kg
 *    across the whole chain (production to disposal) for a meat-heavier diet.
 *
 * Verified per-kg figures, for reference when changing a factor below:
 *  CO2e: beef 33 (dairy herd) - 99 (beef herd), lamb 40, pork 12.3, poultry 9.9,
 *    farmed fish 13.6, cheese 23.9, eggs 4.7, milk 3.2, rice 4.5, wheat 1.6,
 *    maize 1.7, oatmeal 2.5, pulses 1.0-1.8, cane sugar 3.2, bananas 0.9,
 *    apples 0.4, tomatoes 2.1, potatoes 0.5, other vegetables 0.5, soy milk 1.0.
 *  Water (L/kg): beef 15,415, sheep/goat 8,763, pork 5,988, chicken 4,325,
 *    eggs 3,265, butter 5,553, milk 1,020, cereals 1,644, pulses 4,055,
 *    oil crops 2,364, fruits 962, starchy roots 387, vegetables 322.
 *  NOT in those datasets, so the matching factors are our own estimates:
 *    prepared meals, baked goods (wheat is used as the proxy), beverages
 *    (other than soy milk and wine), the water footprint of fish and seafood,
 *    and the "other" category.
 *
 * Change a number here and the whole platform follows; bump FACTORS_VERSION so
 * stored orders record which table produced them.
 */

const FACTORS_VERSION = '2026-10-v4';

// Keys match the Listing.category enum.
// basis: 'published' = the factors are taken from the published data listed
// above; 'partial' = CO2e is published but the water figure is our own
// estimate; 'estimate' = our own estimate, because that kind of food is not in
// those datasets. The methodology page shows this to the public.
const CATEGORY_FACTORS = {
  meat: {
    label: 'Meat & Poultry',
    basis: 'published',
    defaultWeightKg: 0.4,
    co2ePerKg: 12, // ~pork (12.3), between poultry 9.9 and farmed fish 13.6; lamb 40, beef 33-99 are left out
    waterPerKg: 4500, // = chicken (4,325); pork 5,988, sheep/goat 8,763, beef 15,415
  },
  seafood: {
    label: 'Fish & Seafood',
    basis: 'partial',
    defaultWeightKg: 0.4,
    co2ePerKg: 13.6, // = farmed fish (13.6); farmed prawns are 26.9, so this leans low
    waterPerKg: 3000, // our estimate: fish is not in the Mekonnen & Hoekstra tables
  },
  dairy: {
    label: 'Dairy & Eggs',
    basis: 'published',
    defaultWeightKg: 0.4,
    co2ePerKg: 4, // milk 3.2, eggs 4.7, cheese 23.9 - weighted to milk, yoghurt, eggs
    waterPerKg: 1200, // milk 1,020; eggs 3,265 and cheese are higher
  },
  meals: {
    label: 'Prepared Meals',
    basis: 'estimate',
    defaultWeightKg: 0.45,
    co2ePerKg: 3, // our estimate: a 450 g plate of rice, chicken, veg and oil works out near 3.1; WRAP wasted food 2.7
    waterPerKg: 1500, // same plate works out near 1,400
  },
  'baked-goods': {
    label: 'Baked Goods',
    basis: 'estimate',
    defaultWeightKg: 0.3,
    co2ePerKg: 1.4, // our estimate; wheat & rye is 1.6 per kg of grain
    waterPerKg: 1500, // cereals average 1,644
  },
  'fruit-veg': {
    label: 'Fruits & Veg',
    basis: 'published',
    defaultWeightKg: 0.8,
    co2ePerKg: 0.6, // apples 0.4, bananas 0.9, veg 0.4-0.5, tomatoes 2.1; simple mean is about 0.7
    waterPerKg: 500, // fruits 962, vegetables 322, starchy roots 387
  },
  pantry: {
    label: 'Pantry',
    basis: 'published',
    defaultWeightKg: 0.5,
    co2ePerKg: 2, // rice 4.5, wheat 1.6, maize 1.7, oatmeal 2.5, pulses 1-1.8, cane sugar 3.2
    waterPerKg: 1800, // cereals 1,644, pulses 4,055, oil crops 2,364
  },
  beverages: {
    label: 'Beverages',
    basis: 'estimate',
    defaultWeightKg: 0.5,
    co2ePerKg: 1.0, // our estimate, per litre: soy milk 1.0, wine 1.8; not in the datasets
    waterPerKg: 600, // our estimate: between beer (about 300) and wine (about 870); not verified
  },
  other: {
    label: 'Other',
    basis: 'estimate',
    defaultWeightKg: 0.4,
    co2ePerKg: 2.5, // our estimate, below the mean of the categories above, on purpose
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
      basis: f.basis,
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

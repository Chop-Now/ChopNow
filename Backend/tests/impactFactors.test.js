/**
 * Environmental impact estimates (config/impactFactors.js) - pure maths, no database.
 *
 * kg = quantity x weight of one item; CO2e and water = kg x the category's factor.
 * Weight comes from the listing's unit, else a weight in the title, else the
 * category default - vendors never have to enter anything extra.
 */
const {
  CATEGORY_FACTORS,
  MIN_ITEM_KG,
  MAX_ITEM_KG,
  parseWeightKg,
  unitWeightKg,
  impactForItem,
  impactForItems,
  methodology,
} = require('../config/impactFactors');

describe('parseWeightKg - reading a weight out of a listing title', () => {
  it.each([
    ['Fresh Avocados 1kg', 1],
    ['Fresh Avocados 1 KG', 1],
    ['Rice 2.5kg', 2.5],
    ['Rice 2,5 kg', 2.5],
    ['Mandazi 12 pieces 500g', 0.5],
    ['Milk 1l', 1],
    ['Milk 1 litre', 1],
    ['Juice 750ml', 0.75],
    ['Juice 33cl', 0.33],
    ['Yoghurt 500ml x4', 2],
    ['Yoghurt 4 x 250g', 1],
    ['Rice 1kg + Juice 500ml', 1.5],
  ])('%s -> %s kg', (title, expected) => {
    expect(parseWeightKg(title)).toBeCloseTo(expected, 5);
  });

  it.each([
    ['Chicken Meal'],
    ['Combo 2 for 1'],
    ['Size 5 sandals'],
    ['Open 24h'],
    [''],
    [null],
    [undefined],
    [42],
  ])('finds nothing in %p', (title) => {
    expect(parseWeightKg(title)).toBeNull();
  });

  it('ignores weights outside the believable range for one item', () => {
    expect(parseWeightKg('Sample 5g')).toBeNull(); // below MIN_ITEM_KG
    expect(parseWeightKg('Pallet 500kg')).toBeNull(); // above MAX_ITEM_KG
    expect(parseWeightKg(`Bag ${MAX_ITEM_KG}kg`)).toBe(MAX_ITEM_KG);
    expect(parseWeightKg(`Pack ${MIN_ITEM_KG * 1000}g`)).toBeCloseTo(MIN_ITEM_KG, 5);
  });
});

describe('unitWeightKg - vendors who sell by weight or volume', () => {
  it('knows kg, g and litre style units, in any case', () => {
    expect(unitWeightKg('kg')).toBe(1);
    expect(unitWeightKg(' KG ')).toBe(1);
    expect(unitWeightKg('g')).toBe(0.001);
    expect(unitWeightKg('litre')).toBe(1);
    expect(unitWeightKg('ml')).toBe(0.001);
  });

  it('returns null for count units and rubbish', () => {
    expect(unitWeightKg('piece')).toBeNull();
    expect(unitWeightKg('portion')).toBeNull();
    expect(unitWeightKg('')).toBeNull();
    expect(unitWeightKg(undefined)).toBeNull();
    expect(unitWeightKg(5)).toBeNull();
  });

  it('is not fooled by names that exist on every object', () => {
    expect(unitWeightKg('constructor')).toBeNull();
    expect(unitWeightKg('toString')).toBeNull();
    expect(unitWeightKg('__proto__')).toBeNull();
  });
});

describe('impactForItem', () => {
  it('uses the category default weight when nothing better is known', () => {
    const r = impactForItem(
      { quantity: 2, title: 'Chicken Meal' },
      { category: 'meals', unit: 'piece' }
    );
    const f = CATEGORY_FACTORS.meals;
    expect(r.basis).toBe('default');
    expect(r.unitKg).toBe(f.defaultWeightKg);
    expect(r.kg).toBeCloseTo(2 * f.defaultWeightKg, 4);
    expect(r.co2e).toBeCloseTo(2 * f.defaultWeightKg * f.co2ePerKg, 3);
    expect(r.water).toBeCloseTo(2 * f.defaultWeightKg * f.waterPerKg, 1);
  });

  it('prefers a weight in the title over the default', () => {
    const r = impactForItem({ quantity: 3, title: 'Avocados 1kg' }, { category: 'fruit-veg' });
    expect(r.basis).toBe('title');
    expect(r.kg).toBe(3);
    expect(r.co2e).toBeCloseTo(3 * CATEGORY_FACTORS['fruit-veg'].co2ePerKg, 3);
  });

  it('prefers the listing unit over the title', () => {
    // Sold per kg, so quantity IS kilograms - the "500g" in the title is ignored.
    const r = impactForItem(
      { quantity: 4, title: 'Tomatoes 500g' },
      { category: 'fruit-veg', unit: 'kg' }
    );
    expect(r.basis).toBe('unit');
    expect(r.kg).toBe(4);
  });

  it('falls back to "other" for a missing or unknown category', () => {
    for (const category of [undefined, null, '', 'nonsense', 'constructor', '__proto__', 7]) {
      const r = impactForItem({ quantity: 1, title: 'x' }, { category });
      expect(r.category).toBe('other');
      expect(Number.isFinite(r.co2e)).toBe(true);
      expect(r.kg).toBe(CATEGORY_FACTORS.other.defaultWeightKg);
    }
    expect(impactForItem({ quantity: 1 }).category).toBe('other');
  });

  it('treats a missing, zero or negative quantity as one item', () => {
    for (const quantity of [undefined, 0, -3, 'abc']) {
      expect(impactForItem({ quantity }, { category: 'meals' }).quantity).toBe(1);
    }
  });

  it('never produces NaN, whatever it is given', () => {
    const r = impactForItem(undefined, undefined);
    for (const v of [r.kg, r.co2e, r.water, r.unitKg]) expect(Number.isFinite(v)).toBe(true);
  });
});

describe('impactForItems', () => {
  it('sums lines, counts meals as items, and looks listings up by id', () => {
    const listings = new Map([
      ['a1', { category: 'meals' }],
      ['b2', { category: 'fruit-veg', unit: 'kg' }],
    ]);
    const { items, totals } = impactForItems(
      [
        { listing: 'a1', quantity: 2, title: 'Rice & beans' },
        { listing: { _id: 'b2' }, quantity: 3, title: 'Bananas' },
      ],
      listings
    );
    expect(items).toHaveLength(2);
    expect(totals.meals).toBe(5);
    expect(totals.kg).toBeCloseTo(2 * CATEGORY_FACTORS.meals.defaultWeightKg + 3, 4);
    expect(totals.co2e).toBeCloseTo(items[0].co2e + items[1].co2e, 3);
  });

  it('copes with an empty or missing order', () => {
    expect(impactForItems([], new Map()).totals).toEqual({ meals: 0, kg: 0, co2e: 0, water: 0 });
    expect(impactForItems(undefined).totals.meals).toBe(0);
  });

  it('uses the "other" category for a listing that no longer exists', () => {
    const { items } = impactForItems([{ listing: 'gone', quantity: 1 }], new Map());
    expect(items[0].category).toBe('other');
  });
});

describe('the factor table and methodology()', () => {
  it('has a plausible, complete entry for every category', () => {
    for (const [key, f] of Object.entries(CATEGORY_FACTORS)) {
      expect(f.label).toBeTruthy();
      expect(f.defaultWeightKg).toBeGreaterThanOrEqual(MIN_ITEM_KG);
      expect(f.defaultWeightKg).toBeLessThanOrEqual(MAX_ITEM_KG);
      expect(f.co2ePerKg).toBeGreaterThan(0);
      expect(f.waterPerKg).toBeGreaterThan(0);
      expect(key).toBe(key.trim());
    }
  });

  it('covers every Listing category', () => {
    const Listing = require('../models/Listing');
    const enumValues = Listing.schema.path('category').enumValues;
    expect(enumValues.length).toBeGreaterThan(0);
    for (const value of enumValues) expect(CATEGORY_FACTORS).toHaveProperty(value);
  });

  it('describes the method publicly, with sources', () => {
    const m = methodology();
    expect(m.version).toBeTruthy();
    expect(m.categories).toHaveLength(Object.keys(CATEGORY_FACTORS).length);
    expect(m.sources.length).toBeGreaterThan(0);
    m.sources.forEach((s) => expect(s.name && s.use).toBeTruthy());
  });
});

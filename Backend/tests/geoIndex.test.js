/**
 * "Nearby" shops use $geoNear, which returns a 500 if the businesses location
 * index is missing. Production has autoIndex off, so the server makes sure it
 * exists at startup.
 */
const mongoose = require('mongoose');
const { ensureGeoIndexes } = require('../config/database');

describe('ensureGeoIndexes', () => {
  it('creates the businesses 2dsphere index, and is safe to run repeatedly', async () => {
    const businesses = mongoose.connection.collection('businesses');
    try {
      await businesses.dropIndex('location_2dsphere');
    } catch {
      // not there yet - that is the situation being tested
    }
    await ensureGeoIndexes();
    await ensureGeoIndexes();
    const indexes = await businesses.indexes();
    expect(indexes.filter((i) => i.name === 'location_2dsphere')).toHaveLength(1);
    expect(indexes.find((i) => i.name === 'location_2dsphere').key).toEqual({
      location: '2dsphere',
    });
  });
});

const mongoose = require('mongoose');

const ID_PARAMS = ['id', 'orderId', 'businessId', 'listingId', 'addressId', 'referenceId'];

/**
 * Rejects a malformed ObjectId in the URL with a 400 before any controller runs.
 * Without this, Mongoose throws a CastError and the caller sees a 500 for what is
 * really a bad request (e.g. GET /api/orders/not-an-id).
 */
function guardIdParams(router) {
  ID_PARAMS.forEach((name) => {
    router.param(name, (req, res, next, value) => {
      if (mongoose.isValidObjectId(value)) return next();
      return res.status(400).json({ message: `Invalid ${name === 'id' ? 'id' : name}` });
    });
  });
  return router;
}

module.exports = { guardIdParams };

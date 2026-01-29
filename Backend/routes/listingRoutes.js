const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getNearbyListings,
  getListingById,
  updateListing,
  deleteListing,
  uploadPhotos,
  getListingsByBusiness
} = require('../controllers/listingController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateCreateListing } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, getListings);
router.get('/nearby', optionalAuth, getNearbyListings);
router.get('/business/:businessId', getListingsByBusiness);
router.get('/:id', optionalAuth, getListingById);

// Protected routes - business owner or admin
router.post('/', protect, authorize('business_owner', 'admin'), validateCreateListing, createListing);
router.put('/:id', protect, authorize('business_owner', 'admin'), updateListing);
router.delete('/:id', protect, authorize('business_owner', 'admin'), deleteListing);

// Image upload routes
router.post('/:id/photos', protect, authorize('business_owner', 'admin'), upload.array('photos', 5), uploadPhotos);

module.exports = router;

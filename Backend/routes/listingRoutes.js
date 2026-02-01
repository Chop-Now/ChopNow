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

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Get all listings
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of listings
 */
router.get('/', optionalAuth, getListings);
router.get('/nearby', optionalAuth, getNearbyListings);
router.get('/business/:businessId', getListingsByBusiness);
router.get('/:id', optionalAuth, getListingById);

// Protected routes - business owner or admin

/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Listing created
 */
router.post('/', protect, authorize('business_owner', 'admin'), validateCreateListing, createListing);
router.put('/:id', protect, authorize('business_owner', 'admin'), updateListing);
router.delete('/:id', protect, authorize('business_owner', 'admin'), deleteListing);

// Image upload routes
router.post('/:id/photos', protect, authorize('business_owner', 'admin'), upload.array('photos', 5), uploadPhotos);

module.exports = router;

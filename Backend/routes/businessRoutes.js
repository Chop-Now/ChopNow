const express = require('express');
const router = express.Router();
const {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  uploadLogo,
  uploadCoverImage,
  uploadPhotos,
  getMyBusinesses,
  getBusinessStats
} = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateCreateBusiness } = require('../middleware/validation');

// Public routes

/**
 * @swagger
 * /businesses:
 *   get:
 *     summary: Get all businesses
 *     tags: [Businesses]
 *     responses:
 *       200:
 *         description: List of businesses
 */
router.get('/', getBusinesses);
router.get('/:id', getBusinessById);

// Protected routes - business owner or admin

/**
 * @swagger
 * /businesses:
 *   post:
 *     summary: Create a new business
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Business created
 */
router.post('/', protect, authorize('business_owner', 'admin'), validateCreateBusiness, createBusiness);
router.put('/:id', protect, authorize('business_owner', 'admin'), updateBusiness);
router.delete('/:id', protect, authorize('business_owner', 'admin'), deleteBusiness);

// Image upload routes
router.post('/:id/logo', protect, authorize('business_owner', 'admin'), upload.single('logo'), uploadLogo);
router.post('/:id/cover', protect, authorize('business_owner', 'admin'), upload.single('cover'), uploadCoverImage);
router.post('/:id/photos', protect, authorize('business_owner', 'admin'), upload.array('photos', 10), uploadPhotos);

// Get my businesses
router.get('/my/list', protect, authorize('business_owner', 'admin'), getMyBusinesses);

// Get business stats
router.get('/:id/stats', protect, authorize('business_owner', 'admin'), getBusinessStats);

module.exports = router;

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
  getMyBusinesses
} = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getBusinesses);
router.get('/:id', getBusinessById);

// Protected routes - business owner or admin
router.post('/', protect, authorize('business_owner', 'admin'), createBusiness);
router.put('/:id', protect, authorize('business_owner', 'admin'), updateBusiness);
router.delete('/:id', protect, authorize('business_owner', 'admin'), deleteBusiness);

// Image upload routes
router.post('/:id/logo', protect, authorize('business_owner', 'admin'), upload.single('logo'), uploadLogo);
router.post('/:id/cover', protect, authorize('business_owner', 'admin'), upload.single('cover'), uploadCoverImage);
router.post('/:id/photos', protect, authorize('business_owner', 'admin'), upload.array('photos', 10), uploadPhotos);

// Get my businesses
router.get('/my/list', protect, authorize('business_owner', 'admin'), getMyBusinesses);

module.exports = router;

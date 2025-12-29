const express = require('express');
const router = express.Router();
const {
  createReview,
  getBusinessReviews,
  getReviewById,
  updateReview,
  deleteReview,
  addBusinessResponse,
  getMyReviews
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/business/:businessId', getBusinessReviews);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', protect, authorize('consumer'), createReview);
router.get('/my/list', protect, getMyReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Business owner routes
router.post('/:id/response', protect, authorize('business_owner', 'admin'), addBusinessResponse);

module.exports = router;

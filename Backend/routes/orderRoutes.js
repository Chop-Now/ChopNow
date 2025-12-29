const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  verifyPickupCode
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Business owner and admin routes
router.put('/:id/status', protect, authorize('business_owner', 'admin'), updateOrderStatus);
router.post('/:id/verify-pickup', protect, authorize('business_owner', 'admin'), verifyPickupCode);

// Customer can cancel
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;

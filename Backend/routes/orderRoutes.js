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
const { validateCreateOrder, validateUpdateOrderStatus } = require('../middleware/validation');

// Protected routes

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *               - quantity
 *             properties:
 *               listingId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order created
 */
router.post('/', protect, validateCreateOrder, createOrder);
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Business owner and admin routes
router.put('/:id/status', protect, authorize('business_owner', 'admin'), validateUpdateOrderStatus, updateOrderStatus);
router.post('/:id/verify-pickup', protect, authorize('business_owner', 'admin'), verifyPickupCode);

// Customer can cancel
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;

const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  // Support both 'role' (legacy single role) and 'roles' (new array format)
  // Both are optional - controller defaults to ['consumer'] if neither provided
  body('role')
    .optional()
    .isIn(['consumer', 'business_owner', 'rider', 'admin'])
    .withMessage('Role must be consumer, business_owner, rider, or admin'),
  body('roles')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Roles must be a non-empty array')
    .custom((roles) => {
      const validRoles = ['consumer', 'business_owner', 'rider', 'admin'];
      for (const role of roles) {
        if (!validRoles.includes(role)) {
          throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
        }
      }
      return true;
    }),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Business creation validation
const validateCreateBusiness = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('type')
    .isIn(['farmer', 'restaurant', 'bakery', 'supermarket', 'grocery', 'cafe', 'other'])
    .withMessage('Invalid business type'),
  body('contact.email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid contact email')
    .normalizeEmail(),
  body('contact.phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number'),
  body('address').notEmpty().withMessage('Address is required'),
  handleValidationErrors,
];

// Listing creation validation
const validateCreateListing = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('business').isMongoId().withMessage('Valid business ID is required'),
  body('category')
    .isIn(['fruit-veg', 'baked-goods', 'meals', 'dairy', 'meat', 'beverages', 'pantry', 'other'])
    .withMessage(
      'Invalid category. Must be one of: fruit-veg, baked-goods, meals, dairy, meat, beverages, pantry, other'
    ),
  body('pricing.originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  body('pricing.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('inventory.quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('timeWindow.availableFrom').isISO8601().withMessage('Available from must be a valid date'),
  body('timeWindow.availableUntil')
    .isISO8601()
    .withMessage('Available until must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.timeWindow?.availableFrom)) {
        throw new Error('Available until must be after available from');
      }
      return true;
    }),
  handleValidationErrors,
];

// Order creation validation
const validateCreateOrder = [
  body('listing').isMongoId().withMessage('Valid listing ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a positive number'),
  body('fulfillmentType')
    .isIn(['pickup', 'delivery'])
    .withMessage('Fulfillment type must be pickup or delivery'),
  body('deliveryDetails.address')
    .if(body('fulfillmentType').equals('delivery'))
    .notEmpty()
    .withMessage('Delivery address is required for delivery orders'),
  body('payment.paymentMethod')
    .isIn(['card', 'mobile_money', 'cash'])
    .withMessage('Payment method must be card, mobile_money, or cash'),
  handleValidationErrors,
];

// Order status update validation
const validateUpdateOrderStatus = [
  param('id').isMongoId().withMessage('Valid order ID is required'),
  body('status')
    .isIn([
      'pending',
      'confirmed',
      'preparing',
      'ready_for_pickup',
      'out_for_delivery',
      'completed',
      'cancelled',
    ])
    .withMessage('Invalid order status'),
  handleValidationErrors,
];

// Review creation validation
const validateCreateReview = [
  body('order').isMongoId().withMessage('Valid order ID is required'),
  body('business').isMongoId().withMessage('Valid business ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors,
];

// Password reset validation
const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  handleValidationErrors,
];

// Forgot password validation
const validateForgotPassword = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  handleValidationErrors,
];

// Payout request validation
const validatePayoutRequest = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
  body('method').isIn(['bank', 'mobile']).withMessage('Payment method must be bank or mobile'),
  handleValidationErrors,
];

// Payout status update validation
const validatePayoutStatus = [
  param('id').isMongoId().withMessage('Valid payout ID is required'),
  body('status')
    .isIn(['processing', 'completed', 'failed', 'cancelled'])
    .withMessage('Invalid payout status'),
  body('reference')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Reference cannot be empty if provided'),
  handleValidationErrors,
];

// Dispute creation validation
const validateCreateDispute = [
  body('order').isMongoId().withMessage('Valid order ID is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
  body('type')
    .optional()
    .isIn(['quality', 'missing_items', 'wrong_order', 'late_delivery', 'other'])
    .withMessage('Invalid dispute type'),
  handleValidationErrors,
];

// MongoId param validation
const validateMongoId = [
  param('id').isMongoId().withMessage('Valid ID is required'),
  handleValidationErrors,
];

// Pagination sanitization middleware
const sanitizePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  req.pagination = {
    page: Math.max(page, 1),
    limit,
    skip: (Math.max(page, 1) - 1) * limit,
  };
  next();
};

module.exports = {
  handleValidationErrors,
  sanitizePagination,
  validateRegister,
  validateLogin,
  validateCreateBusiness,
  validateCreateListing,
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateCreateReview,
  validateResetPassword,
  validateForgotPassword,
  validatePayoutRequest,
  validatePayoutStatus,
  validateCreateDispute,
  validateMongoId,
};

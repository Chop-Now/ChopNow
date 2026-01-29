const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  getUsersForAdmin,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  validateRegister,
  validateLogin,
  validateResetPassword,
  validateForgotPassword
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);

// Email verification
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password reset
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// OTP login
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Admin-only: list all users
router.get('/', protect, authorize('admin'), getUsersForAdmin);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Address routes
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;

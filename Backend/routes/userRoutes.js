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
  getUsersForAdmin
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

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

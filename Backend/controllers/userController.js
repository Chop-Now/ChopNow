const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, phone, role, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      phone,
      role,
      firstName,
      lastName
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended' });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phone = req.body.phone || user.phone;
      
      if (req.body.preferences) {
        user.preferences = { ...user.preferences, ...req.body.preferences };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/users/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'chopnow/avatars');

    // Update user
    const user = await User.findById(req.user._id);
    user.avatar = result.secure_url;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatar: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add address to user profile
 * @route   POST /api/users/addresses
 * @access  Private
 */
const addAddress = async (req, res) => {
  try {
    const { label, street, city, coordinates, isDefault } = req.body;

    if (!street || !city || !coordinates) {
      return res.status(400).json({ message: 'Please provide street, city, and coordinates' });
    }

    const user = await User.findById(req.user._id);

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      label,
      street,
      city,
      location: {
        type: 'Point',
        coordinates: coordinates // [lng, lat]
      },
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/users/addresses/:addressId
 * @access  Private
 */
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Update fields
    if (req.body.label) address.label = req.body.label;
    if (req.body.street) address.street = req.body.street;
    if (req.body.city) address.city = req.body.city;
    if (req.body.coordinates) {
      address.location.coordinates = req.body.coordinates;
    }

    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
    }

    await user.save();

    res.json({
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.pull(req.params.addressId);
    await user.save();

    res.json({
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  addAddress,
  updateAddress,
  deleteAddress
};

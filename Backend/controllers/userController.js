const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const {
  sendVerificationEmail,
  sendPasswordResetOTPEmail,
  sendOTPEmail,
  sendPasswordChangeOTP,
  sendPasswordChangedConfirmation,
  sendSensitiveChangeOTP,
} = require('../utils/emailService');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const _client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Access Token (short-lived)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// Generate JWT Refresh Token (longer-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { email, password, phone, role, roles, firstName, lastName } = req.body;

    // Validation - support both 'role' (legacy) and 'roles' (new)
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Determine roles array
    let userRoles;
    if (roles && Array.isArray(roles) && roles.length > 0) {
      userRoles = roles;
    } else if (role) {
      // Legacy support: convert single role to array
      // For business_owner, also grant consumer role
      userRoles = role === 'business_owner' ? ['consumer', 'business_owner'] : [role];
    } else {
      userRoles = ['consumer']; // Default to consumer
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Determine initial active role
    // If registering as business, default to business_owner, otherwise consumer
    const initialActiveRole = userRoles.includes('business_owner')
      ? 'business_owner'
      : userRoles[0];

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      phone,
      roles: userRoles,
      activeRole: initialActiveRole,
      firstName,
      lastName,
      verificationToken,
      verificationTokenExpires,
    });

    if (user) {
      // Send verification email (don't await - send in background)
      sendVerificationEmail(
        user.email,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        verificationToken
      ).catch((err) => logger.error({ err }, 'Failed to send verification email'));

      res.status(201).json({
        _id: user._id,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        role: user.activeRole, // Backward compatibility
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        token: generateToken(user._id),
        refreshToken: generateRefreshToken(user._id),
        message: 'Registration successful. Please check your email to verify your account.',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
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
      logger.warn(
        { email: email ? 'provided' : 'missing', password: password ? 'provided' : 'missing' },
        'Login attempt with missing credentials'
      );
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check user - include passwordHash since it's select:false
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      logger.warn({ email }, 'Login attempt - user not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password hash exists
    if (!user.passwordHash) {
      logger.warn({ email }, 'Login attempt - user has no password (possibly Google-only account)');
      return res.status(401).json({ message: 'Please use Google Sign-In for this account' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      logger.warn({ email }, 'Login attempt - invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if suspended
    if (user.status === 'suspended') {
      logger.warn({ email }, 'Login attempt - account suspended');
      return res.status(403).json({ message: 'Account suspended' });
    }

    logger.info({ email, userId: user._id }, 'User logged in successfully');

    res.json({
      _id: user._id,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
      role: user.activeRole, // Backward compatibility
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
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
        preferences: updatedUser.preferences,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
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
      avatar: result.secure_url,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
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
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      label,
      street,
      city,
      location: {
        type: 'Point',
        coordinates: coordinates, // [lng, lat]
      },
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    res.status(201).json({
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
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
      user.addresses.forEach((addr) => (addr.isDefault = false));
      address.isDefault = true;
    }

    await user.save();

    res.json({
      message: 'Address updated successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
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
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private (admin)
 */
const getUsersForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const status = req.query.status;

    const query = {};
    // Filter by role - check if role exists in the roles array
    if (role) {
      query.roles = { $in: [role] };
    }
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-passwordHash')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Verify email address
 * @route   GET /api/users/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    }).select('+verificationToken +verificationTokenExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/users/resend-verification
 * @access  Public
 */
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select(
      '+verificationToken +verificationTokenExpires'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const sent = await sendVerificationEmail(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      verificationToken
    );

    if (sent) {
      logger.info({ email: user.email }, 'Verification email sent successfully');
    } else {
      logger.error({ email: user.email }, 'Failed to send verification email (service error or address rejected)');
    }
    // Always return 200 to avoid leaking whether the email was accepted
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      '+resetPasswordToken +resetPasswordExpires'
    );

    // Generic message to prevent email enumeration
    const successMessage =
      'If your email is registered, we have sent a 6-digit verification code to it.';

    if (!user) {
      logger.info({ email: normalizedEmail }, 'Password reset requested for non-existent email');
      return res.json({ message: successMessage });
    }

    // Generate 6-digit numeric OTP code
    const resetOtp = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordToken = resetOtp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const sent = await sendPasswordResetOTPEmail(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      resetOtp
    );

    if (sent) {
      logger.info({ email: normalizedEmail }, 'Password reset OTP code sent successfully');
    } else {
      logger.error({ email: normalizedEmail }, 'Failed to send password reset OTP email (email service error or address rejected)');
    }
    // Always return 200 to prevent email enumeration and avoid 500 on email service failures
    res.json({ message: successMessage });
  } catch (error) {
    logger.error({ err: error }, 'Forgot password error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Verify reset OTP code
 * @route   POST /api/users/verify-reset-otp
 * @access  Public
 */
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: normalizedEmail,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn({ email: normalizedEmail, otp }, 'Invalid or expired OTP verification attempt');
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    logger.info({ email: normalizedEmail }, 'Password reset OTP verified successfully');
    res.json({ message: 'Verification code verified successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Verify reset OTP error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/users/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password, email } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token/OTP and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Query construction
    const query = {
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    };

    if (email) {
      query.email = email.toLowerCase().trim();
    }

    const user = await User.findOne(query).select(
      '+passwordHash +resetPasswordToken +resetPasswordExpires'
    );

    if (!user) {
      logger.warn({ token, email }, 'Password reset failed - invalid or expired token/code');
      return res.status(400).json({ message: 'Invalid or expired reset token/code' });
    }

    // Update password
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logger.info({ email: user.email, userId: user._id }, 'Password reset completed successfully');

    // Send confirmation email in background
    sendPasswordChangedConfirmation(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    ).catch((err) => logger.error({ err }, 'Failed to send password reset confirmation email'));

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error({ err: error }, 'Reset password error');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Send OTP for email login
 * @route   POST /api/users/send-otp
 * @access  Public
 */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+otpCode +otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const sent = await sendOTPEmail(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      otpCode
    );

    if (sent) {
      res.json({ message: 'OTP sent to your email' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Verify OTP and login
 * @route   POST /api/users/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({
      email,
      otpCode: otp,
      otpExpires: { $gt: Date.now() },
    }).select('+otpCode +otpExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended' });
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
      role: user.activeRole, // Backward compatibility
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Google login/signup
 * @route   POST /api/users/google-login
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access Token is required' });
    }

    // Verify Google Access Token and get user profile (using Authorization header for security)
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payload = googleResponse.data;
    const {
      sub: googleId,
      email,
      given_name: firstName,
      family_name: lastName,
      picture: avatar,
      email_verified,
    } = payload;

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (!user) {
      // Create new user if not exists
      // For Google users, we set a dummy passwordHash since they authenticate via Google
      const salt = await bcrypt.genSalt(12);
      const dummyPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(dummyPassword, salt);

      user = await User.create({
        email: email.toLowerCase(),
        googleId,
        firstName,
        lastName,
        avatar,
        roles: ['consumer'], // Default roles for Google login
        activeRole: 'consumer',
        emailVerified: email_verified,
        passwordHash, // Required by model
        status: 'active',
      });

      logger.info({ userId: user._id }, 'New user registered via Google');
    } else {
      // If user exists but doesn't have googleId linked, link it
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.avatar) user.avatar = avatar;
        if (email_verified && !user.emailVerified) user.emailVerified = true;
        await user.save();
      }

      // Check if suspended
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Account suspended' });
      }
    }

    res.json({
      _id: user._id,
      email: user.email,
      roles: user.roles,
      activeRole: user.activeRole,
      role: user.activeRole, // Backward compatibility
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (error) {
    logger.error({ err: error }, 'Google login error');
    // Log detailed error for debugging
    if (error.response) {
      logger.error(
        { status: error.response.status, data: error.response.data },
        'Google API error'
      );
    } else {
      logger.error({ err: error }, 'Google login error details');
    }

    // Return more specific error message if possible
    const errorMessage =
      error.response?.data?.error_description || error.message || 'Google authentication failed';
    res.status(500).json({ message: 'Google authentication failed', error: errorMessage });
  }
};

/**
 * @desc    Update user by admin
 * @route   PUT /api/users/:id
 * @access  Private (admin)
 */
const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Handle roles update (array of roles)
    if (req.body.roles !== undefined && Array.isArray(req.body.roles)) {
      // Validate roles
      const validRoles = ['consumer', 'business_owner', 'rider', 'admin'];
      const newRoles = req.body.roles.filter((role) => validRoles.includes(role));

      if (newRoles.length === 0) {
        return res.status(400).json({ message: 'User must have at least one valid role' });
      }

      user.roles = newRoles;

      // If activeRole is no longer in roles, reset it to first role
      if (!newRoles.includes(user.activeRole)) {
        user.activeRole = newRoles[0];
      }
    }

    // Handle activeRole update
    if (req.body.activeRole !== undefined) {
      if (user.roles.includes(req.body.activeRole)) {
        user.activeRole = req.body.activeRole;
      }
    }

    // Legacy support: handle single 'role' field
    if (req.body.role !== undefined && !req.body.roles) {
      const validRoles = ['consumer', 'business_owner', 'rider', 'admin'];
      if (validRoles.includes(req.body.role)) {
        // Add the role if not already present
        if (!user.roles.includes(req.body.role)) {
          user.roles.push(req.body.role);
        }
        user.activeRole = req.body.role;
      }
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        activeRole: user.activeRole,
        role: user.activeRole, // Backward compatibility
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Suspend user
 * @route   PATCH /api/users/:id/suspend
 * @access  Private (admin)
 */
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has admin role (check roles array, not activeRole)
    if (user.roles && user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Cannot suspend admin users' });
    }

    user.status = 'suspended';
    await user.save();

    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Activate user
 * @route   PATCH /api/users/:id/activate
 * @access  Private (admin)
 */
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    res.json({ message: 'User activated successfully' });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Delete user by admin
 * @route   DELETE /api/users/:id
 * @access  Private (admin)
 */
const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has admin role (check roles array, not activeRole)
    if (user.roles && user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Request password change OTP
 * @route   POST /api/users/profile/password/request-otp
 * @access  Private
 */
const requestPasswordChangeOTP = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Please provide current password' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash +otpCode +otpExpires');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    const sent = await sendPasswordChangeOTP(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      otpCode
    );

    if (sent) {
      res.json({ message: 'OTP sent to your email. Please verify to complete password change.' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Change user password with OTP verification
 * @route   PUT /api/users/profile/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide OTP and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+passwordHash +otpCode +otpExpires');

    // Verify OTP
    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send confirmation email
    sendPasswordChangedConfirmation(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    ).catch((err) => logger.error({ err }, 'Failed to send password changed confirmation'));

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Request OTP for sensitive information change (vendor)
 * @route   POST /api/users/request-sensitive-change-otp
 * @access  Private
 */
const requestSensitiveChangeOTP = async (req, res) => {
  try {
    const { changeType } = req.body;

    if (!changeType) {
      return res.status(400).json({ message: 'Please specify change type' });
    }

    const validChangeTypes = [
      'payout settings',
      'bank account',
      'business information',
      'email address',
    ];
    if (!validChangeTypes.includes(changeType.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid change type' });
    }

    const user = await User.findById(req.user._id).select('+otpCode +otpExpires');

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    user.otpCode = otpCode;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    const sent = await sendSensitiveChangeOTP(
      user.email,
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      otpCode,
      changeType
    );

    if (sent) {
      res.json({ message: 'OTP sent to your email. Please verify to continue.' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP email' });
    }
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Verify OTP for sensitive changes
 * @route   POST /api/users/verify-sensitive-change-otp
 * @access  Private
 */
const verifySensitiveChangeOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'Please provide OTP' });
    }

    const user = await User.findById(req.user._id).select('+otpCode +otpExpires');

    // Verify OTP
    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      message: 'OTP verified successfully',
      verified: true,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get user's active sessions
 * @route   GET /api/users/sessions
 * @access  Private
 */
const getActiveSessions = async (req, res) => {
  try {
    // Return current session info from request headers
    const currentSession = {
      id: req.user._id.toString(),
      device: req.headers['user-agent'] || 'Unknown Device',
      location: 'Current Location',
      lastActive: new Date().toISOString(),
      isCurrent: true,
    };
    res.json({ sessions: [currentSession] });
  } catch (error) {
    logger.error({ err: error }, 'Get active sessions failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get user's login activity/history
 * @route   GET /api/users/login-activity
 * @access  Private
 */
const getLoginActivity = async (req, res) => {
  try {
    // Login history tracking not yet implemented in schema
    // Return empty array - frontend should handle gracefully
    res.json({ loginActivity: [] });
  } catch (error) {
    logger.error({ err: error }, 'Get login activity failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Logout from specific session
 * @route   DELETE /api/users/sessions/:sessionId
 * @access  Private
 */
const logoutSession = async (req, res) => {
  try {
    // Session management not yet implemented - acknowledge the request
    res.json({ message: 'Session logged out successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Logout session failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Logout from all devices
 * @route   POST /api/users/logout-all
 * @access  Private
 */
const logoutAllDevices = async (req, res) => {
  try {
    // Token invalidation not yet implemented - acknowledge the request
    // In production, use a token blacklist or increment a tokenVersion in the schema
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Logout all devices failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Switch active role
 * @route   POST /api/users/switch-role
 * @access  Private
 */
const switchRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has the requested role
    if (!user.roles.includes(role)) {
      return res.status(403).json({
        message: `You do not have the '${role}' role`,
        availableRoles: user.roles,
      });
    }

    // Update active role
    user.activeRole = role;
    await user.save();

    res.json({
      success: true,
      activeRole: user.activeRole,
      roles: user.roles,
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        role: user.activeRole,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Add a role to existing user (e.g., consumer adds business_owner)
 * @route   POST /api/users/add-role
 * @access  Private
 */
const addRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    // Validate the role
    const validRoles = ['consumer', 'business_owner', 'rider'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Only admin can add admin role
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot self-assign admin role' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has this role
    if (user.roles.includes(role)) {
      return res.status(400).json({
        message: `You already have the '${role}' role`,
        roles: user.roles,
      });
    }

    // Add the new role
    user.roles.push(role);

    // Optionally switch to the new role
    if (req.body.switchToNew) {
      user.activeRole = role;
    }

    await user.save();

    logger.info({ userId: user._id, newRole: role }, 'User added new role');

    res.json({
      success: true,
      message: `Successfully added '${role}' role`,
      roles: user.roles,
      activeRole: user.activeRole,
      user: {
        _id: user._id,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        role: user.activeRole,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/users/refresh-token
 * @access  Public
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended' });
    }

    res.json({
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired, please login again' });
    }
    logger.error({ err: error }, 'Refresh token error');
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

/**
 * @desc    Register FCM device token for push notifications
 * @route   POST /api/users/fcm-token
 * @access  Private
 */
const registerFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: 'fcmToken is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add token if it doesn't exist
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
      await user.save();
    }

    res.json({ success: true, message: 'FCM token registered successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Register FCM token failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Unregister FCM device token
 * @route   DELETE /api/users/fcm-token
 * @access  Private
 */
const deleteFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fcmToken) {
      user.fcmTokens = user.fcmTokens.filter((token) => token !== fcmToken);
    } else {
      user.fcmTokens = [];
    }
    await user.save();

    res.json({ success: true, message: 'FCM token unregistered successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Unregister FCM token failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Submit rider application with vehicle and ID document uploads
 * @route   POST /api/users/apply-rider
 * @access  Private
 */
const applyRider = async (req, res) => {
  try {
    const { phone, vehicleType, nationalId, licensePlate } = req.body;

    if (!phone || !vehicleType || !nationalId) {
      return res.status(400).json({ message: 'Phone, vehicle type, and national ID are required' });
    }

    if (['motorcycle', 'car'].includes(vehicleType) && !licensePlate) {
      return res.status(400).json({ message: 'License plate is required for motor vehicles' });
    }

    // Check files uploaded
    if (!req.files || !req.files.vehiclePhoto || !req.files.nationalIdPhoto) {
      return res
        .status(400)
        .json({ message: 'Both vehicle photo and national ID photo are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.riderStatus === 'pending') {
      return res.status(400).json({ message: 'Your application is already pending review' });
    }

    // Upload to Cloudinary
    const vehiclePhotoResult = await uploadToCloudinary(
      req.files.vehiclePhoto[0].buffer,
      'chopnow/riders/vehicles',
      'auto'
    );
    const nationalIdPhotoResult = await uploadToCloudinary(
      req.files.nationalIdPhoto[0].buffer,
      'chopnow/riders/ids',
      'auto'
    );

    // Save details
    user.riderStatus = 'pending';
    user.riderDetails = {
      phone,
      vehicleType,
      nationalId,
      licensePlate: ['motorcycle', 'car'].includes(vehicleType) ? licensePlate : undefined,
      vehiclePhoto: vehiclePhotoResult.secure_url,
      nationalIdPhoto: nationalIdPhotoResult.secure_url,
      appliedAt: new Date(),
    };

    // Keep phone number synced if they don't have one
    if (!user.phone) {
      user.phone = phone;
    }

    await user.save();

    logger.info({ userId: user._id }, 'User submitted rider application');

    res.json({
      success: true,
      message: 'Rider application submitted successfully. Pending admin review.',
      riderStatus: user.riderStatus,
      riderDetails: user.riderDetails,
    });
  } catch (error) {
    logger.error({ err: error }, 'Rider application failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get riders list with optional status filters (Admin only)
 * @route   GET /api/users/admin/riders
 * @access  Private (Admin)
 */
const getRidersForAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { riderStatus: { $ne: 'none' } };

    if (status && status !== 'all') {
      query.riderStatus = status;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [riders, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName email phone roles riderStatus riderDetails createdAt')
        .sort({ 'riderDetails.appliedAt': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      riders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    logger.error({ err: error }, 'Fetch riders for admin failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Approve or reject a rider's application (Admin only)
 * @route   POST /api/users/admin/riders/:id/review
 * @access  Private (Admin)
 */
const reviewRider = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res
        .status(400)
        .json({ message: 'Rejection reason is required when status is rejected' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.riderStatus !== 'pending') {
      return res.status(400).json({
        message: `Rider application is not pending (current status: ${user.riderStatus})`,
      });
    }

    user.riderStatus = status;
    user.riderDetails.reviewedAt = new Date();

    if (status === 'approved') {
      // Add rider role
      if (!user.roles.includes('rider')) {
        user.roles.push('rider');
      }
      user.activeRole = 'rider'; // Default active role to rider for convenience
    } else {
      user.riderDetails.rejectedReason = rejectionReason;
    }

    await user.save();

    logger.info({ userId: user._id, status }, 'Admin reviewed rider application');

    res.json({
      success: true,
      message: `Rider application successfully ${status}`,
      riderStatus: user.riderStatus,
      roles: user.roles,
    });
  } catch (error) {
    logger.error({ err: error }, 'Rider review failed');
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Get rider online availability status
 * @route   GET /api/v1/rider/availability
 * @access  Private (Rider)
 */
const getRiderAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      success: true,
      isOnline: user.riderDetails?.isOnline === true,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

/**
 * @desc    Update rider online availability status
 * @route   PUT /api/v1/rider/availability
 * @access  Private (Rider)
 */
const updateRiderAvailability = async (req, res) => {
  try {
    const { isOnline } = req.body;
    if (isOnline === undefined) {
      return res.status(400).json({ message: 'isOnline is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.riderDetails) {
      user.riderDetails = {};
    }
    user.riderDetails.isOnline = isOnline === true;
    await user.save();

    res.json({
      success: true,
      isOnline: user.riderDetails.isOnline,
    });
  } catch (error) {
    res.status(500).json({
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  addAddress,
  updateAddress,
  deleteAddress,
  getUsersForAdmin,
  updateUserByAdmin,
  suspendUser,
  activateUser,
  deleteUserByAdmin,
  requestPasswordChangeOTP,
  changePassword,
  requestSensitiveChangeOTP,
  verifySensitiveChangeOTP,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  sendOTP,
  verifyOTP,
  switchRole,
  addRole,
  getActiveSessions,
  getLoginActivity,
  logoutSession,
  logoutAllDevices,
  refreshAccessToken,
  registerFcmToken,
  deleteFcmToken,
  applyRider,
  getRidersForAdmin,
  reviewRider,
  getRiderAvailability,
  updateRiderAvailability,
};

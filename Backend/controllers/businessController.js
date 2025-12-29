const Business = require('../models/Business');
const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinaryUpload');

/**
 * @desc    Create a new business
 * @route   POST /api/businesses
 * @access  Private (business_owner, admin)
 */
const createBusiness = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      contact,
      address,
      deliverySettings
    } = req.body;

    // Validation
    if (!name || !type || !contact || !address) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const business = await Business.create({
      name,
      type,
      description,
      owner: req.user._id,
      contact,
      address,
      deliverySettings
    });

    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all businesses with filters
 * @route   GET /api/businesses
 * @access  Public
 */
const getBusinesses = async (req, res) => {
  try {
    const { type, status, search, lat, lng, radius = 5000 } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by type
    if (type) query.type = type;

    // Filter by status (default to active only)
    query.status = status || 'active';

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Geospatial search (nearby businesses)
    if (lat && lng) {
      query['address.location'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) // in meters
        }
      };
    }

    const businesses = await Business.find(query)
      .populate('owner', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Business.countDocuments(query);

    res.json({
      businesses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get business by ID
 * @route   GET /api/businesses/:id
 * @access  Public
 */
const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone');

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update business
 * @route   PUT /api/businesses/:id
 * @access  Private (owner or admin)
 */
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check ownership
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this business' });
    }

    // Update fields
    const allowedUpdates = ['name', 'type', 'description', 'contact', 'address', 'deliverySettings'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    await business.save();

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete business
 * @route   DELETE /api/businesses/:id
 * @access  Private (owner or admin)
 */
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check ownership
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this business' });
    }

    await business.deleteOne();

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Upload business logo
 * @route   POST /api/businesses/:id/logo
 * @access  Private (owner or admin)
 */
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check ownership
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'chopnow/businesses/logos');

    business.media.logo = result.secure_url;
    await business.save();

    res.json({
      message: 'Logo uploaded successfully',
      logo: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Upload business cover image
 * @route   POST /api/businesses/:id/cover
 * @access  Private (owner or admin)
 */
const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check ownership
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'chopnow/businesses/covers');

    business.media.coverImage = result.secure_url;
    await business.save();

    res.json({
      message: 'Cover image uploaded successfully',
      coverImage: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Upload business photos
 * @route   POST /api/businesses/:id/photos
 * @access  Private (owner or admin)
 */
const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check ownership
    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Upload to Cloudinary
    const photoUrls = await uploadMultipleToCloudinary(req.files, 'chopnow/businesses/photos');

    business.media.photos.push(...photoUrls);
    await business.save();

    res.json({
      message: 'Photos uploaded successfully',
      photos: business.media.photos
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get my businesses
 * @route   GET /api/businesses/my/list
 * @access  Private (business_owner)
 */
const getMyBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  uploadLogo,
  uploadCoverImage,
  uploadPhotos,
  getMyBusinesses
};

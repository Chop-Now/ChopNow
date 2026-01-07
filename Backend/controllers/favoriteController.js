const Favorite = require('../models/Favorite');

/**
 * @desc    Toggle favorite (add or remove)
 * @route   POST /api/favorites/toggle
 * @access  Private
 */
const toggleFavorite = async (req, res) => {
  try {
    const { favoriteType, referenceId } = req.body;

    if (!favoriteType || !referenceId) {
      return res.status(400).json({ message: 'Please provide favoriteType and referenceId' });
    }

    const result = await Favorite.toggleFavorite(req.user._id, favoriteType, referenceId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user favorites
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = async (req, res) => {
  try {
    const { favoriteType } = req.query;
    let query = { user: req.user._id };

    if (favoriteType) {
      query.favoriteType = favoriteType;
    }

    const favorites = await Favorite.find(query)
      .populate('business', 'name type address media stats')
      .populate('listing', 'title category pricing photos timeWindow')
      .sort({ createdAt: -1 });

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Check if item is favorited
 * @route   GET /api/favorites/check/:favoriteType/:referenceId
 * @access  Private
 */
const checkFavorite = async (req, res) => {
  try {
    const { favoriteType, referenceId } = req.params;

    const isFavorited = await Favorite.isFavorited(req.user._id, favoriteType, referenceId);

    res.json({ isFavorited });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
  checkFavorite
};

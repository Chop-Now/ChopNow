import api from './api';

const favoriteService = {
  // Toggle favorite (add or remove)
  toggleFavorite: async (favoriteType, favoriteId) => {
    try {
      const response = await api.post('/api/favorites/toggle', {
        favoriteType,
        favoriteId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all favorites
  getFavorites: async (type = null) => {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await api.get(`/api/favorites${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Check if item is favorited
  checkFavorite: async (favoriteType, favoriteId) => {
    try {
      const response = await api.get('/api/favorites/check', {
        params: {
          favoriteType,
          favoriteId,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default favoriteService;

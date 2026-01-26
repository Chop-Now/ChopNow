import api from './api';

const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/api/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get reviews for a business
  getBusinessReviews: async (businessId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/api/reviews/business/${businessId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single review
  getReviewById: async (id) => {
    try {
      const response = await api.get(`/api/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get my reviews
  getMyReviews: async () => {
    try {
      const response = await api.get('/api/reviews/my/reviews');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update review
  updateReview: async (id, reviewData) => {
    try {
      const response = await api.put(`/api/reviews/${id}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete review
  deleteReview: async (id) => {
    try {
      const response = await api.delete(`/api/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add business response
  addBusinessResponse: async (id, response) => {
    try {
      const res = await api.post(`/api/reviews/${id}/response`, { response });
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default reviewService;

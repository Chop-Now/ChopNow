import api from './api';

const analyticsService = {
    // Get platform overview stats (Admin)
    getPlatformOverview: async () => {
        try {
            const response = await api.get('/api/analytics/platform/overview');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get business overview stats (Business Owner)
    getBusinessOverview: async () => {
        try {
            const response = await api.get('/api/analytics/business/overview');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get my impact (Consumer/Business)
  getMyImpact: async () => {
    try {
      const response = await api.get('/api/analytics/impact/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get impact leaderboard
    getImpactLeaderboard: async () => {
        try {
            const response = await api.get('/api/analytics/impact/leaderboard');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default analyticsService;

import api from './api';

// The dashboard mounts four widgets (stats cards and three charts) that each ask for the same
// heavy report. Share one in-flight request, and keep the answer for a few seconds, so the page
// makes one call instead of four (each took 1.5-3s on production, and they queued behind each other).
const SHARE_MS = 10000;
const shared = new Map();
const sharedGet = (url) => {
  const hit = shared.get(url);
  if (hit && Date.now() - hit.at < SHARE_MS) return hit.promise;
  const promise = api.get(url).then((response) => response.data);
  shared.set(url, { at: Date.now(), promise });
  // A failure must not be remembered: the next caller should try again
  promise.catch(() => shared.delete(url));
  return promise;
};

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
      return await sharedGet('/api/analytics/business/overview');
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: read-only audit of how much data looks like test data
  getTestDataAudit: async () => {
    try {
      const response = await api.get('/api/analytics/admin/data-audit');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: what the test-data purge would remove (changes nothing)
  previewTestDataPurge: async () => {
    try {
      const response = await api.get('/api/analytics/admin/data-purge', { timeout: 60000 });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admin: delete test data. `confirmation` must be the exact phrase the preview returns.
  runTestDataPurge: async (confirmation) => {
    try {
      const response = await api.post(
        '/api/analytics/admin/data-purge',
        { confirmation },
        { timeout: 180000 }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // How impact is estimated: factor table and sources (public)
  getImpactMethodology: async () => {
    try {
      const response = await api.get('/api/analytics/impact/methodology');
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

  // Get recent platform activity (Admin only)
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await api.get(`/api/analytics/platform/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user activity log (Admin only)
  getUserActivity: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        limit: params.limit || 20,
        page: params.page || 1,
        timeRange: params.timeRange || '7days',
      });
      const response = await api.get(`/api/analytics/user-activity?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get admin dashboard stats (Admin only)
  getAdminStats: async () => {
    try {
      return await sharedGet('/api/analytics/admin/stats');
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default analyticsService;

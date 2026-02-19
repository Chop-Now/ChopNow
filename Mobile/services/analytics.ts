import api from './api';

export const analyticsService = {
  // Consumer
  getMyImpact:           () => api.get('/api/analytics/impact/my').then(r => r.data),
  getLeaderboard:        () => api.get('/api/analytics/impact/leaderboard').then(r => r.data),
  // Business owner
  getBusinessOverview:   (businessId?: string) =>
    api.get('/api/analytics/business/overview', { params: businessId ? { businessId } : {} }).then(r => r.data),
  // Admin
  getPlatformOverview:   () => api.get('/api/analytics/platform/overview').then(r => r.data),
  getRecentActivity:     () => api.get('/api/analytics/platform/activity').then(r => r.data),
  getUserActivity:       (page = 1) => api.get('/api/analytics/user-activity', { params: { page } }).then(r => r.data),
  getAdminStats:         () => api.get('/api/analytics/admin/stats').then(r => r.data),
};

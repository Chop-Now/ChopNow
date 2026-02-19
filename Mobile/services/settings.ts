import api from './api';

export const settingsService = {
  getPublic:        () => api.get('/api/settings/public').then(r => r.data),
  getMaintenance:   () => api.get('/api/settings/maintenance').then(r => r.data),
  checkFeature:     (featureName: string) => api.get(`/api/settings/feature/${featureName}`).then(r => r.data),
  getCommission:    () => api.get('/api/settings/commission').then(r => r.data),
  // Admin
  getAll:           () => api.get('/api/settings').then(r => r.data),
  update:           (data: object) => api.put('/api/settings', data).then(r => r.data),
};

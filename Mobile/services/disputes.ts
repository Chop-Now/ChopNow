import api from './api';

export interface CreateDisputePayload {
  orderId:     string;
  title:       string;
  description: string;
  type:        string;
}

export const disputeService = {
  create:    (payload: CreateDisputePayload) => api.post('/api/disputes', payload).then(r => r.data),
  getMyOwn:  (page = 1) => api.get('/api/disputes/me', { params: { page } }).then(r => r.data),
  getById:   (id: string) => api.get(`/api/disputes/${id}`).then(r => r.data),
  // Admin
  getAll:    (params?: object) => api.get('/api/disputes/admin', { params }).then(r => r.data),
  getStats:  () => api.get('/api/disputes/stats').then(r => r.data),
  resolve:   (id: string, resolution: string, status: string) =>
    api.patch(`/api/disputes/${id}/resolve`, { resolution, status }).then(r => r.data),
  // Business
  getBusiness: () => api.get('/api/disputes/business').then(r => r.data),
};

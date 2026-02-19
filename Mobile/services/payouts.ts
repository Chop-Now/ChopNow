import api from './api';

export const payoutService = {
  request:   (amount: number, method: string, details: object) =>
    api.post('/api/payouts/request', { amount, method, details }).then(r => r.data),
  getMyOwn:  (page = 1) => api.get('/api/payouts/me', { params: { page } }).then(r => r.data),
  // Admin
  getAll:    (params?: object) => api.get('/api/payouts/admin', { params }).then(r => r.data),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/api/payouts/${id}/status`, { status, notes }).then(r => r.data),
};

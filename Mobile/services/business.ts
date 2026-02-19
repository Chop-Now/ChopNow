import api from './api';

export interface CreateBusinessPayload {
  name:        string;
  description: string;
  category:    string;
  address:     string;
  phone:       string;
  email:       string;
}

export const businessService = {
  create:          (data: CreateBusinessPayload) => api.post('/api/businesses', data).then(r => r.data),
  getMyList:       () => api.get('/api/businesses/my/list').then(r => r.data),
  getById:         (id: string) => api.get(`/api/businesses/${id}`).then(r => r.data),
  update:          (id: string, data: Partial<CreateBusinessPayload>) => api.put(`/api/businesses/${id}`, data).then(r => r.data),
  getStats:        (id: string) => api.get(`/api/businesses/${id}/stats`).then(r => r.data),
  submitKYC:       (id: string, formData: FormData) =>
    api.post(`/api/businesses/${id}/kyc`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  uploadLogo:      (id: string, formData: FormData) =>
    api.post(`/api/businesses/${id}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  uploadCover:     (id: string, formData: FormData) =>
    api.post(`/api/businesses/${id}/cover`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  // Admin
  getAll:          (params?: object) => api.get('/api/businesses', { params }).then(r => r.data),
  getPending:      () => api.get('/api/businesses/pending').then(r => r.data),
  approve:         (id: string) => api.patch(`/api/businesses/${id}/approve`).then(r => r.data),
  reject:          (id: string, reason: string) => api.patch(`/api/businesses/${id}/reject`, { reason }).then(r => r.data),
  requestInfo:     (id: string, message: string) => api.patch(`/api/businesses/${id}/request-info`, { message }).then(r => r.data),
  rescind:         (id: string, reason: string) => api.patch(`/api/businesses/${id}/rescind`, { reason }).then(r => r.data),
};

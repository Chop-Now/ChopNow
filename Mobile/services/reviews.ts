import api from './api';

export interface CreateReviewPayload {
  businessId: string;
  orderId:    string;
  rating:     number;
  comment:    string;
}

export const reviewService = {
  create:        (payload: CreateReviewPayload) => api.post('/api/reviews', payload).then(r => r.data),
  getForBusiness:(businessId: string, page = 1) => api.get(`/api/reviews/business/${businessId}`, { params: { page } }).then(r => r.data),
  getMyReviews:  (page = 1) => api.get('/api/reviews/my/list', { params: { page } }).then(r => r.data),
  update:        (id: string, data: Partial<CreateReviewPayload>) => api.put(`/api/reviews/${id}`, data).then(r => r.data),
  remove:        (id: string) => api.delete(`/api/reviews/${id}`).then(r => r.data),
  addResponse:   (id: string, response: string) => api.post(`/api/reviews/${id}/response`, { response }).then(r => r.data),
};

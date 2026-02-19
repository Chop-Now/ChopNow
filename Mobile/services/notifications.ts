import api from './api';

export const notificationService = {
  getAll:       (page = 1) => api.get('/api/notifications', { params: { page } }).then(r => r.data),
  getUnreadCount: ()        => api.get('/api/notifications/unread/count').then(r => r.data),
  markRead:     (id: string)=> api.put(`/api/notifications/${id}/read`).then(r => r.data),
  markAllRead:  ()           => api.put('/api/notifications/read-all').then(r => r.data),
  remove:       (id: string) => api.delete(`/api/notifications/${id}`).then(r => r.data),
};

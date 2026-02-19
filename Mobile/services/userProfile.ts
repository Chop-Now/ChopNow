import api from './api';

export const userProfileService = {
  // Profile
  update:                  (data: object) => api.put('/api/users/profile', data).then(r => r.data),
  uploadAvatar:            (formData: FormData) =>
    api.post('/api/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),

  // Password
  requestPasswordOTP:      () => api.post('/api/users/profile/password/request-otp').then(r => r.data),
  changePassword:          (currentPassword: string, newPassword: string, otp: string) =>
    api.put('/api/users/profile/password', { currentPassword, newPassword, otp }).then(r => r.data),

  // Forgot password
  forgotPassword:          (email: string) => api.post('/api/users/forgot-password', { email }).then(r => r.data),
  resetPassword:           (token: string, newPassword: string) =>
    api.post('/api/users/reset-password', { token, newPassword }).then(r => r.data),

  // OTP auth
  sendOTP:                 (email: string) => api.post('/api/users/send-otp', { email }).then(r => r.data),
  verifyOTP:               (email: string, otp: string) => api.post('/api/users/verify-otp', { email, otp }).then(r => r.data),

  // Addresses
  addAddress:              (address: object) => api.post('/api/users/addresses', address).then(r => r.data),
  updateAddress:           (id: string, address: object) => api.put(`/api/users/addresses/${id}`, address).then(r => r.data),
  deleteAddress:           (id: string) => api.delete(`/api/users/addresses/${id}`).then(r => r.data),

  // Role management
  switchRole:              (role: string) => api.post('/api/users/switch-role', { role }).then(r => r.data),
  addRole:                 (role: string) => api.post('/api/users/add-role', { role }).then(r => r.data),

  // Sessions
  getSessions:             () => api.get('/api/users/sessions').then(r => r.data),
  logoutSession:           (sessionId: string) => api.delete(`/api/users/sessions/${sessionId}`).then(r => r.data),
  logoutAllDevices:        () => api.post('/api/users/logout-all').then(r => r.data),
  getLoginActivity:        () => api.get('/api/users/login-activity').then(r => r.data),

  // Admin
  getAll:                  (params?: object) => api.get('/api/users/', { params }).then(r => r.data),
  updateUser:              (id: string, data: object) => api.put(`/api/users/${id}`, data).then(r => r.data),
  suspendUser:             (id: string, reason: string) => api.patch(`/api/users/${id}/suspend`, { reason }).then(r => r.data),
  activateUser:            (id: string) => api.patch(`/api/users/${id}/activate`).then(r => r.data),
  deleteUser:              (id: string) => api.delete(`/api/users/${id}`).then(r => r.data),
};

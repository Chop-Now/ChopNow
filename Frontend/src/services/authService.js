import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/api/users/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/api/users/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Google Login
  googleLogin: async (accessToken) => {
    try {
      const response = await api.post('/api/users/google-login', { accessToken });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  // Get user token
  getToken: () => {
    const token = localStorage.getItem('token');
    return (token && token !== 'undefined' && token !== 'null') ? token : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/api/users/profile', userData);
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user in localStorage
      const user = authService.getCurrentUser();
      if (user) {
        user.avatar = response.data.avatar;
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add address
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/api/users/address', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/api/users/address/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/api/users/address/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;

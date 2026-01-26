import api from './api';

const businessService = {
  // Get all businesses with filters
  getBusinesses: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.latitude && filters.longitude) {
        params.append('latitude', filters.latitude);
        params.append('longitude', filters.longitude);
        if (filters.maxDistance) params.append('maxDistance', filters.maxDistance);
      }
      if (filters.verified !== undefined) params.append('verified', filters.verified);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/businesses?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single business by ID
  getBusinessById: async (id) => {
    try {
      const response = await api.get(`/api/businesses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get my businesses
  getMyBusinesses: async () => {
    try {
      const response = await api.get('/api/businesses/my/businesses');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create business
  createBusiness: async (businessData) => {
    try {
      const response = await api.post('/api/businesses', businessData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update business
  updateBusiness: async (id, businessData) => {
    try {
      const response = await api.put(`/api/businesses/${id}`, businessData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete business
  deleteBusiness: async (id) => {
    try {
      const response = await api.delete(`/api/businesses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload logo
  uploadLogo: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post(`/api/businesses/${id}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload cover image
  uploadCoverImage: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('coverImage', file);
      
      const response = await api.post(`/api/businesses/${id}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload photos
  uploadPhotos: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos', file);
      });
      
      const response = await api.post(`/api/businesses/${id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default businessService;

import api from './api';

const businessService = {
  // Get all businesses with filters
  getBusinesses: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Backend expects: search, type, status, lat, lng, radius, page, limit
      // Keep backwards compatibility with older param names (latitude/longitude/maxDistance).
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);

      const lat = filters.lat ?? filters.latitude;
      const lng = filters.lng ?? filters.longitude;
      const radius = filters.radius ?? filters.maxDistance;
      if (lat !== undefined && lng !== undefined) {
        params.append('lat', lat);
        params.append('lng', lng);
        if (radius !== undefined) params.append('radius', radius);
      }

      // NOTE: backend does not currently support verified/sort query params.
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
      const response = await api.get('/api/businesses/my/list');
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

  // Get business statistics
  getBusinessStats: async (id) => {
    try {
      const response = await api.get(`/api/businesses/${id}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default businessService;

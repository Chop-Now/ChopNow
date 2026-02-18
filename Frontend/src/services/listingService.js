import api from './api';

const listingService = {
  // Get all listings (public with filters)
  getListings: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/api/listings?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get listings by business (public)
  getListingsByBusiness: async (businessId, status) => {
    try {
      const query = status ? `?status=${status}` : '';
      const response = await api.get(`/api/listings/business/${businessId}${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single listing
  getListingById: async (id) => {
    try {
      const response = await api.get(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create listing
  createListing: async (listingData) => {
    try {
      const response = await api.post('/api/listings', listingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update listing
  updateListing: async (id, updates) => {
    try {
      const response = await api.put(`/api/listings/${id}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete listing
  deleteListing: async (id) => {
    try {
      const response = await api.delete(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload photos
  uploadPhotos: async (id, formData) => {
    try {
      const response = await api.post(`/api/listings/${id}/photos`, formData, {
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

export default listingService;

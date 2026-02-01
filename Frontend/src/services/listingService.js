import api from './api';

const listingService = {
  // Get all listings with filters
  getListings: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minDiscount) params.append('minDiscount', filters.minDiscount);
      if (filters.fulfillmentType) params.append('fulfillmentType', filters.fulfillmentType);
      if (filters.business) params.append('business', filters.business);
      if (filters.availableNow) params.append('availableNow', filters.availableNow);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/listings?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get nearby listings
  // Backend expects: lat, lng, radius (meters). Keep backwards compatibility with (latitude, longitude, maxDistance).
  getNearbyListings: async (latitude, longitude, maxDistance = 10000, filters = {}) => {
    try {
      const lat = filters.lat ?? latitude;
      const lng = filters.lng ?? longitude;
      const radius = filters.radius ?? maxDistance;

      const params = new URLSearchParams();
      params.append('lat', lat);
      params.append('lng', lng);
      params.append('radius', radius);
      if (filters.category) params.append('category', filters.category);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/listings/nearby?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single listing by ID
  getListingById: async (id) => {
    try {
      const response = await api.get(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get listings by business
  getListingsByBusiness: async (businessId) => {
    try {
      const response = await api.get(`/api/listings/business/${businessId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create listing (for business owners)
  createListing: async (listingData) => {
    try {
      const response = await api.post('/api/listings', listingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update listing
  updateListing: async (id, listingData) => {
    try {
      const response = await api.put(`/api/listings/${id}`, listingData);
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

  // Upload listing photos
  uploadPhotos: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos', file);
      });
      
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

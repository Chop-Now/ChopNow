import api from './api';

const orderService = {
  // Create order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all orders (filtered by role)
  getOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.fulfillmentType) params.append('fulfillmentType', filters.fulfillmentType);
      if (filters.business) params.append('business', filters.business);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/api/orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single order by ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancel order
  cancelOrder: async (id, reason) => {
    try {
      const response = await api.patch(`/api/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify pickup code
  verifyPickupCode: async (id, pickupCode) => {
    try {
      const response = await api.post(`/api/orders/${id}/verify-pickup`, { pickupCode });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default orderService;

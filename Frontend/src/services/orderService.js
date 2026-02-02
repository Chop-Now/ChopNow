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

    // Get all orders
    getOrders: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/api/orders?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default orderService;

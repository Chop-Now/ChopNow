import api from './api';

const payoutService = {
    // Request a payout
    requestPayout: async (payoutData) => {
        try {
            const response = await api.post('/api/payouts/request', payoutData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get my payouts (Business Owner)
    getMyPayouts: async () => {
        try {
            const response = await api.get('/api/payouts/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get all payouts (Admin)
    getAllPayouts: async (status) => {
        try {
            const url = status ? `/api/payouts/admin?status=${status}` : '/api/payouts/admin';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update payout status (Admin)
    updatePayoutStatus: async (id, statusData) => {
        try {
            const response = await api.patch(`/api/payouts/${id}/status`, statusData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default payoutService;

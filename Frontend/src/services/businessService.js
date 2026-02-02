import api from './api';

const businessService = {
    // Submit KYC Verification
    submitVerification: async (id, formData) => {
        try {
            const response = await api.post(`/api/businesses/${id}/kyc`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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

    // Get my businesses
    getMyBusinesses: async () => {
        try {
            const response = await api.get('/api/businesses/my/list');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default businessService;

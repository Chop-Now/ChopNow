import api from './api';

const authService = {
    // Register user (buyer or business)
    register: async (userData) => {
        try {
            const response = await api.post('/api/users/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Login user
    login: async (credentials) => {
        try {
            const response = await api.post('/api/users/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Get current user profile
    getProfile: async () => {
        try {
            const response = await api.get('/api/users/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Update profile
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/api/users/profile', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default authService;

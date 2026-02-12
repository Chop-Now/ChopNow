import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

// Request interceptor to add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Check if this request should suppress toast notifications
        const silentMode = error.config?.silent === true;

        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    if (!window.location.pathname.includes('/login')) {
                        // toast.error('Session expired. Please login again.');
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    if (!silentMode) toast.error('You do not have permission to perform this action.');
                    break;
                case 404:
                    if (!silentMode) toast.error(data.message || 'Resource not found.');
                    break;
                case 500:
                    if (!silentMode) toast.error('Server error. Please try again later.');
                    break;
                default:
                    if (!silentMode) toast.error(data.message || 'An error occurred.');
            }
        } else if (error.request) {
            // Request made but no response received
            if (!silentMode) toast.error('Unable to connect to server. Please check your connection.');
        } else {
            // Something else happened
            if (!silentMode) toast.error('An unexpected error occurred.');
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_URL };

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s — fail fast instead of hanging for 60s+ on cold-start servers
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Track whether a token refresh is in progress to avoid duplicate refresh calls
let isRefreshing = false;
// Queue of failed requests waiting for token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Force logout: clear all auth state and redirect
const forceLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

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

// Response interceptor to handle errors and refresh tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Check if this request should suppress toast notifications
    const silentMode = originalRequest?.silent === true;

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401: attempt token refresh before giving up
      if (status === 401 && !originalRequest._retry) {
        // Don't retry refresh-token requests themselves
        if (originalRequest.url?.includes('/refresh-token')) {
          forceLogout();
          return Promise.reject(error);
        }

        // If a refresh is already in progress, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const { data: refreshData } = await axios.post(`${API_URL}/api/users/refresh-token`, {
              refreshToken,
            });
            const newToken = refreshData.token;
            const newRefreshToken = refreshData.refreshToken;

            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            processQueue(null, newToken);
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            forceLogout();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // No refresh token available, force logout
          isRefreshing = false;
          forceLogout();
          return Promise.reject(error);
        }
      }

      // Handle other error statuses
      switch (status) {
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
          if (status !== 401 && !silentMode) toast.error(data.message || 'An error occurred.');
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

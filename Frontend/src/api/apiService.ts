import { 
  UsersApi, 
  OrdersApi, 
  BusinessesApi, 
  ListingsApi, 
  Configuration 
} from './generated';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://api.chopnow.app/api';

/**
 * Global configuration for generated API clients
 */
const apiConfig = new Configuration({
  basePath: BASE_URL,
});

// Shared Axios instance to manage headers globally
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to inject Auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('chopnow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Exported API instances for use in components/hooks
 */
export const usersApi = new UsersApi(apiConfig, BASE_URL, axiosInstance);
export const ordersApi = new OrdersApi(apiConfig, BASE_URL, axiosInstance);
export const businessesApi = new BusinessesApi(apiConfig, BASE_URL, axiosInstance);
export const listingsApi = new ListingsApi(apiConfig, BASE_URL, axiosInstance);

/**
 * Utility to set an Idempotency-Key for a specific request
 */
export const withIdempotency = (key: string) => {
  return {
    headers: {
      'Idempotency-Key': key
    }
  };
};

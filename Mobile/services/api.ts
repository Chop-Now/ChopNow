/**
 * Mobile API Service
 * Adapted from the web app's api.js:
 * - SecureStore instead of localStorage
 * - No window/toast — uses callbacks for error handling
 * - Same interceptor logic for token refresh
 */
import axios from 'axios';
import { storage } from './storage';
import { API_URL } from '../constants';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];
let onForceLogoutCallback: (() => void) | null = null;

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

export const setForceLogoutCallback = (cb: () => void) => {
  onForceLogoutCallback = cb;
};

const forceLogout = async () => {
  await storage.remove(storage.KEYS.TOKEN);
  await storage.remove(storage.KEYS.REFRESH_TOKEN);
  await storage.remove(storage.KEYS.USER);
  onForceLogoutCallback?.();
};

// ── Request interceptor: attach token ────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await storage.get(storage.KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 + token refresh ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/refresh-token')) {
        await forceLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await storage.get(storage.KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/users/refresh-token`, {
            refreshToken,
          });
          await storage.save(storage.KEYS.TOKEN, data.token);
          if (data.refreshToken) {
            await storage.save(storage.KEYS.REFRESH_TOKEN, data.refreshToken);
          }
          api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
          originalRequest.headers.Authorization   = `Bearer ${data.token}`;
          processQueue(null, data.token);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          await forceLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
        await forceLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

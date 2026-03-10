import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '@constants/index';

// Sync wrapper — token okuma senkron yapılamaz, interceptor'da handle ediyoruz
let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

// Uygulama başlarken token'ları cache'e yükle
AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN).then(t => { cachedAccessToken = t; });
AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN).then(t => { cachedRefreshToken = t; });

const storage = {
  getString: (key: string): string | null => {
    if (key === STORAGE_KEYS.ACCESS_TOKEN) return cachedAccessToken;
    if (key === STORAGE_KEYS.REFRESH_TOKEN) return cachedRefreshToken;
    return null;
  },
  set: (key: string, value: string): void => {
    if (key === STORAGE_KEYS.ACCESS_TOKEN) cachedAccessToken = value;
    if (key === STORAGE_KEYS.REFRESH_TOKEN) cachedRefreshToken = value;
    AsyncStorage.setItem(key, value);
  },
  clearAll: (): void => {
    cachedAccessToken = null;
    cachedRefreshToken = null;
    AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.USER]);
  },
};

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getString(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor (Token Refresh) ────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storage.getString(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        // Token yok, logout yap
        storage.clearAll();
        // NavigationService.reset('Auth') — navigation servisini entegre edince ekle
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken } = response.data.data;
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        storage.clearAll();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

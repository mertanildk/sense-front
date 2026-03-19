import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '@constants/index';

// Token cache — AsyncStorage async olduğu için bellekte tutuyoruz
let cachedToken: string | null = null;

AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN).then(t => { cachedToken = t; });

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
    if (cachedToken && config.headers) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    if (error.response?.status === 401) {
      // Token geçersiz — session temizle
      cachedToken = null;
      await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.USER]);
    }
    return Promise.reject(error);
  },
);

export const setAuthToken = (token: string | null) => {
  cachedToken = token;
  if (token) {
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
};

export default api;

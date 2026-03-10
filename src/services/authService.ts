import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@constants/index';
import type { AuthTokens, LoginRequest, RegisterRequest, User, ApiResponse } from '@appTypes/index';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const { user, tokens } = response.data.data;
    authService.saveTokens(tokens);
    authService.saveUser(user);
    return { user, tokens };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { user, tokens } = response.data.data;
    authService.saveTokens(tokens);
    authService.saveUser(user);
    return { user, tokens };
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      authService.clearSession();
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  // ─── Local Storage Helpers ────────────────────────────────────────────────
  saveTokens(tokens: AuthTokens): void {
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  saveUser(user: User): void {
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  async getStoredUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  clearSession(): void {
    AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
  },
};

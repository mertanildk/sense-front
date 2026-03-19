import api, { setAuthToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@constants/index';
import type { LoginRequest, RegisterRequest, LoginResponse, User } from '@appTypes/index';

export const authService = {

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', data);
    const result = response.data;
    setAuthToken(result.token);
    // User bilgisini me endpoint'inden çek
    const user = await authService.getMe();
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return result;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/register', data);
    const result = response.data;
    setAuthToken(result.token);
    const user = await authService.getMe();
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return result;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/users/me');
    return response.data;
  },

  async logout(): Promise<void> {
    setAuthToken(null);
    await AsyncStorage.multiRemove([STORAGE_KEYS.ACCESS_TOKEN, STORAGE_KEYS.USER]);
  },

  async getStoredUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  saveUser(user: User): void {
    AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};

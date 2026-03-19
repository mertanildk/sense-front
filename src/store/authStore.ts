import { create } from 'zustand';
import { authService } from '@services/authService';
import { setAuthToken } from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@constants/index';
import type { User, LoginRequest, RegisterRequest } from '@appTypes/index';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      setAuthToken(token);
      const user = await authService.getStoredUser();
      set({ user, isLoggedIn: true });
      // Arka planda güncel user bilgisini çek
      authService.getMe()
        .then(freshUser => {
          set({ user: freshUser });
          authService.saveUser(freshUser);
        })
        .catch(() => {
          // Token geçersizse logout
          set({ user: null, isLoggedIn: false });
        });
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(data);
      const user = await authService.getStoredUser();
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message
        ?? error?.response?.data
        ?? 'Kullanıcı adı veya şifre hatalı.';
      set({ error: String(message), isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      const user = await authService.getStoredUser();
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (error: any) {
      const message = error?.response?.data?.message
        ?? error?.response?.data
        ?? 'Kayıt olunamadı.';
      set({ error: String(message), isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({ user: null, isLoggedIn: false, isLoading: false });
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    authService.saveUser(updated);
  },

  refreshUser: async () => {
    try {
      const user = await authService.getMe();
      set({ user });
      authService.saveUser(user);
    } catch { /* sessizce geç */ }
  },

  clearError: () => set({ error: null }),
}));

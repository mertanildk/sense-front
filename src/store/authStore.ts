import { create } from 'zustand';
import { authService } from '@services/authService';
import type { User, LoginRequest, RegisterRequest } from '@appTypes/index';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => void;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    const user = await authService.getStoredUser();
    const isLoggedIn = await authService.isLoggedIn();
    set({ user, isLoggedIn });
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.login(data);
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Giriş yapılamadı. Lütfen tekrar deneyin.';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.register(data);
      set({ user, isLoggedIn: true, isLoading: false });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Kayıt olunamadı. Lütfen tekrar deneyin.';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    authService.saveUser(updated);
  },

  clearError: () => set({ error: null }),
}));

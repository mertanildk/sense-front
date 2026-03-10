// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api/v1'   // Android emulator → localhost
  : 'https://api.yourdomain.com/api/v1';

export const WS_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080'
  : 'wss://api.yourdomain.com';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  ONBOARDING_DONE: 'onboarding_done',
} as const;

// ─── Stream ───────────────────────────────────────────────────────────────────
export const STREAM = {
  FREE_WATCH_SECONDS: 180,         // 3 dakika ücretsiz
  FREE_WATCH_WARNING_SECONDS: 15,  // Uyarı ne zaman çıksın
  COINS_PER_MINUTE: 5,             // Dakika başı jeton
  COMMENT_MAX_LENGTH: 150,
  GIFT_ANIMATION_DURATION: 3000,
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  STREAMS_LIMIT: 12,
} as const;

// ─── Categories ───────────────────────────────────────────────────────────────
export const STREAM_CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: 'grid' },
  { id: 'gaming', label: 'Oyun', icon: 'gamepad-2' },
  { id: 'music', label: 'Müzik', icon: 'music' },
  { id: 'chat', label: 'Sohbet', icon: 'message-circle' },
  { id: 'education', label: 'Eğitim', icon: 'book-open' },
  { id: 'sport', label: 'Spor', icon: 'trophy' },
  { id: 'cooking', label: 'Yemek', icon: 'utensils' },
] as const;

// ─── Coin Packages (fallback - normally fetched from API) ─────────────────────
export const DEFAULT_COIN_PACKAGES = [
  { id: '1', name: 'Başlangıç', coinAmount: 100, priceTry: 29.99 },
  { id: '2', name: 'Popüler', coinAmount: 250, priceTry: 59.99, isPopular: true },
  { id: '3', name: 'Premium', coinAmount: 600, priceTry: 119.99 },
  { id: '4', name: 'VIP', coinAmount: 1500, priceTry: 249.99 },
] as const;

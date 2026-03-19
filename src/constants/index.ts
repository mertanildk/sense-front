// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL = 'https://galaxy-destroyer.capulus.co';

export const WS_BASE_URL = 'https://galaxy-destroyer.capulus.co';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user_data',
} as const;

// ─── İzleme Kuralları ─────────────────────────────────────────────────────────
export const STREAM = {
  FREE_WATCH_SECONDS: 180,
  FREE_WATCH_WARNING_SECONDS: 15,
  CREDITS_PER_MINUTE: 5,
  COMMENT_MAX_LENGTH: 150,
  GIFT_ANIMATION_DURATION: 3000,
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_SIZE: 20,
} as const;

// ─── Hediye Tipleri ───────────────────────────────────────────────────────────
export const GIFT_TYPES = [
  { id: 'rose',    label: 'Gül',    emoji: '🌹', credits: 5  },
  { id: 'heart',   label: 'Kalp',   emoji: '❤️', credits: 10 },
  { id: 'star',    label: 'Yıldız', emoji: '⭐', credits: 20 },
  { id: 'crown',   label: 'Taç',    emoji: '👑', credits: 50 },
  { id: 'diamond', label: 'Elmas',  emoji: '💎', credits: 100},
] as const;

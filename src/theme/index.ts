import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────────
export const palette = {
  // Brand
  primary: '#FF3F6C',        // Canlı pembe-kırmızı — enerji, canlılık
  primaryDark: '#CC1F4A',
  primaryLight: '#FF7096',
  accent: '#FFB830',         // Altın — jeton/ödül teması
  accentDark: '#E09B00',

  // Nötrler
  black: '#0A0A0F',
  dark1: '#111118',          // Ana arka plan
  dark2: '#1A1A24',          // Kart arka planı
  dark3: '#252533',          // Input, tab
  dark4: '#32324A',          // Border
  grey1: '#6B6B8A',
  grey2: '#9090AA',
  grey3: '#B8B8CC',
  white: '#FFFFFF',
  whiteA80: 'rgba(255,255,255,0.8)',
  whiteA50: 'rgba(255,255,255,0.5)',
  whiteA20: 'rgba(255,255,255,0.2)',
  whiteA10: 'rgba(255,255,255,0.1)',

  // Semantik
  success: '#22D37C',
  error: '#FF4D4D',
  warning: '#FFB830',
  info: '#4D9EFF',

  // Canlı yayın
  liveBadge: '#FF3F3F',
  liveGlow: 'rgba(255, 63, 63, 0.4)',

  // Gradient stops
  gradientPrimary: ['#FF3F6C', '#FF7F50'],
  gradientDark: ['#0A0A0F', '#1A1A24'],
  gradientCard: ['rgba(26,26,36,0)', 'rgba(10,10,15,0.95)'],
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const typography = {
  // Font families (react-native-vector-icons ile font yüklendikten sonra)
  fontBold: 'System',
  fontSemiBold: 'System',
  fontMedium: 'System',
  fontRegular: 'System',

  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primary: {
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
};

// ─── Screen Dimensions ────────────────────────────────────────────────────────
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

// ─── Combined Theme ───────────────────────────────────────────────────────────
export const theme = {
  palette,
  typography,
  spacing,
  radius,
  shadows,
  screen,
};

export type Theme = typeof theme;

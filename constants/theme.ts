// ============================================================
// THEME CONSTANTS
// Home Supply Checker App
// ============================================================

export const COLORS = {
  dark: {
    background: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceAlt: '#16213E',
    surfaceElevated: '#1F1F35',
    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42CC',
    accent: '#FF6584',
    accentLight: '#FF8FA3',
    bought: '#4CAF50',
    boughtBg: '#1A3320',
    notBought: '#FF6B6B',
    notBoughtBg: '#3A1A1A',
    weekly: '#4FC3F7',
    weeklyBg: '#0D2B3A',
    monthly: '#FFB74D',
    monthlyBg: '#3A2A0D',
    priceUp: '#FF6B6B',
    priceDown: '#4CAF50',
    priceSame: '#9999BB',
    textPrimary: '#F0F0F0',
    textSecondary: '#9999BB',
    textMuted: '#666688',
    border: '#2A2A4A',
    borderLight: '#333355',
    inputBg: '#12122A',
    shadow: 'rgba(0,0,0,0.5)',
    overlay: 'rgba(0,0,0,0.75)',
    tabBar: '#12122A',
    tabBarBorder: '#2A2A4A',
    tabActive: '#6C63FF',
    tabInactive: '#555575',
    success: '#4CAF50',
    warning: '#FFB74D',
    danger: '#FF6B6B',
    info: '#4FC3F7',
  },
  light: {
    background: '#F4F4FC',
    surface: '#FFFFFF',
    surfaceAlt: '#EFEFF8',
    surfaceElevated: '#FAFAFF',
    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42CC',
    accent: '#FF6584',
    accentLight: '#FF8FA3',
    bought: '#2E7D32',
    boughtBg: '#E8F5E9',
    notBought: '#C62828',
    notBoughtBg: '#FFEBEE',
    weekly: '#0277BD',
    weeklyBg: '#E1F5FE',
    monthly: '#E65100',
    monthlyBg: '#FFF3E0',
    priceUp: '#C62828',
    priceDown: '#2E7D32',
    priceSame: '#666688',
    textPrimary: '#1A1A2E',
    textSecondary: '#555575',
    textMuted: '#9999AA',
    border: '#DEDEFF',
    borderLight: '#EDEDFF',
    inputBg: '#F8F8FF',
    shadow: 'rgba(108,99,255,0.1)',
    overlay: 'rgba(0,0,0,0.5)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#DEDEFF',
    tabActive: '#6C63FF',
    tabInactive: '#AAAACC',
    success: '#2E7D32',
    warning: '#E65100',
    danger: '#C62828',
    info: '#0277BD',
  },
} as const;

export type Theme = 'dark' | 'light';
export type ThemeColors = (typeof COLORS)[Theme];

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const CATEGORIES = [
  'Dairy',
  'Produce',
  'Meat & Seafood',
  'Bakery',
  'Frozen',
  'Beverages',
  'Snacks',
  'Cleaning',
  'Hygiene',
  'Household',
  'Baby',
  'Pets',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];

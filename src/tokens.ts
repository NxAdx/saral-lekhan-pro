// ─── Design tokens & Dynamic Themes ───────────────

const sp = [0, 4, 8, 12, 16, 20, 24, 0, 32, 0, 40, 0, 48, 0, 0, 0, 64] as const;

export const sharedTokens = {
  font: {
    sans: 'Hind',
    sansMed: 'Hind-Medium',
    sansSemi: 'Hind-SemiBold',
    sansBold: 'Hind-Bold',
    display: 'VesperLibre-Black',
    mono: 'DMMono-Regular',
  },
  radius: { pill: 9999, xl: 28, lg: 24, md: 16, sm: 12 }, // Updated for Bento
  spacing: sp,
  // Soft Shadows for Bento Grid (Glassmorphism-lite)
  shadow: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 5,
    },
    gentle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    }
  },
  strokeWidth: { sw: 1.5, swThick: 2.5 }
} as const;

export interface ThemeColors {
  bg: string;
  bgRaised: string;
  bgDeep: string;
  stroke: string;
  strokeDim: string;
  ink: string;
  inkMid: string;
  inkDim: string;
  accent: string;
  accentDark: string;
  accentDim: string;
  accentBg: string;
  white: string;
  shadow: string;
}

export type ThemeName = 'classic' | 'nord' | 'amoled' | 'lavender' | 'mocha';

export const themes: Record<ThemeName, ThemeColors> = {
  classic: { // Original Tippani
    bg: '#D9D7D2',
    bgRaised: '#E2E0DB',
    bgDeep: '#C8C6C1',
    stroke: '#2B2926',
    strokeDim: '#9B9790',
    ink: '#1C1A17',
    inkMid: '#5A5751',
    inkDim: '#8E8B85',
    accent: '#C14E28',
    accentDark: '#8B3118',
    accentDim: '#E8866A',
    accentBg: '#F2D5C8',
    white: '#F5F3EF',
    shadow: '#B0AEA9',
  },
  nord: { // Cool Blue Dark
    bg: '#2E3440',
    bgRaised: '#3B4252',
    bgDeep: '#434C5E',
    stroke: '#4C566A',
    strokeDim: '#434C5E',
    ink: '#ECEFF4',
    inkMid: '#E5E9F0',
    inkDim: '#D8DEE9',
    accent: '#88C0D0',
    accentDark: '#81A1C1',
    accentDim: '#5E81AC',
    accentBg: '#3B4252',
    white: '#FFFFFF',
    shadow: '#000000',
  },
  amoled: { // Pure Black
    bg: '#000000',
    bgRaised: '#121212',
    bgDeep: '#1E1E1E',
    stroke: '#2A2A2A',
    strokeDim: '#1E1E1E',
    ink: '#FFFFFF',
    inkMid: '#B3B3B3',
    inkDim: '#808080',
    accent: '#BB86FC',
    accentDark: '#3700B3',
    accentDim: '#7F39FB',
    accentBg: '#121212',
    white: '#FFFFFF',
    shadow: '#000000',
  },
  lavender: { // Light Pastel
    bg: '#F5F3F7',
    bgRaised: '#FFFFFF',
    bgDeep: '#EAE6F0',
    stroke: '#D5CDE3',
    strokeDim: '#EAE6F0',
    ink: '#4A3B5D',
    inkMid: '#695A7E',
    inkDim: '#8E839E',
    accent: '#9D7BCE',
    accentDark: '#7A5CA5',
    accentDim: '#BFA8DF',
    accentBg: '#F0EAF8',
    white: '#FFFFFF',
    shadow: '#D5CDE3',
  },
  mocha: { // Catppuccin
    bg: '#1E1E2E',
    bgRaised: '#313244',
    bgDeep: '#45475A',
    stroke: '#585B70',
    strokeDim: '#45475A',
    ink: '#CDD6F4',
    inkMid: '#BAC2DE',
    inkDim: '#A6ADC8',
    accent: '#CBA6F7',
    accentDark: '#B4BEFE',
    accentDim: '#89B4FA',
    accentBg: '#313244',
    white: '#FFFFFF',
    shadow: '#11111B',
  }
};

// For backward compatibility while refactoring, we temporarily expose T
export const T = {
  color: themes.classic,
  ...sharedTokens
};

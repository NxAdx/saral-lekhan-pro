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

export type ThemeName = 'classic' | 'nord' | 'pitch' | 'lavender';

export interface ThemeVariant {
  light: ThemeColors;
  dark: ThemeColors;
}

export const themes: Record<ThemeName, ThemeVariant> = {
  classic: {
    light: {
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
    dark: {
      bg: '#1C1A17',
      bgRaised: '#2B2926',
      bgDeep: '#12110F',
      stroke: '#3D3A36',
      strokeDim: '#2B2926',
      ink: '#D9D7D2',
      inkMid: '#9B9790',
      inkDim: '#696660',
      accent: '#E8866A',
      accentDark: '#C14E28',
      accentDim: '#8B3118',
      accentBg: '#2B2926',
      white: '#F5F3EF',
      shadow: '#000000',
    }
  },
  nord: {
    light: {
      bg: '#ECEFF4',
      bgRaised: '#FFFFFF',
      bgDeep: '#E5E9F0',
      stroke: '#D8DEE9',
      strokeDim: '#E5E9F0',
      ink: '#2E3440',
      inkMid: '#3B4252',
      inkDim: '#4C566A',
      accent: '#5E81AC',
      accentDark: '#4C566A',
      accentDim: '#81A1C1',
      accentBg: '#E5E9F0',
      white: '#FFFFFF',
      shadow: '#D8DEE9',
    },
    dark: {
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
    }
  },
  pitch: {
    light: {
      bg: '#FFFFFF',
      bgRaised: '#F5F5F5',
      bgDeep: '#EEEEEE',
      stroke: '#E0E0E0',
      strokeDim: '#EEEEEE',
      ink: '#000000',
      inkMid: '#424242',
      inkDim: '#757575',
      accent: '#212121',
      accentDark: '#000000',
      accentDim: '#616161',
      accentBg: '#F5F5F5',
      white: '#FFFFFF',
      shadow: '#EEEEEE',
    },
    dark: {
      bg: '#000000',
      bgRaised: '#121212',
      bgDeep: '#1E1E1E',
      stroke: '#2A2A2A',
      strokeDim: '#1E1E1E',
      ink: '#FFFFFF',
      inkMid: '#B3B3B3',
      inkDim: '#808080',
      accent: '#FFFFFF', // Clean white accent for pitch black
      accentDark: '#B3B3B3',
      accentDim: '#404040',
      accentBg: '#121212',
      white: '#FFFFFF',
      shadow: '#000000',
    }
  },
  lavender: {
    light: {
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
    dark: {
      bg: '#1A1621',
      bgRaised: '#251F2E',
      bgDeep: '#110D17',
      stroke: '#3B3247',
      strokeDim: '#251F2E',
      ink: '#ECE7F0',
      inkMid: '#BFA8DF',
      inkDim: '#8E839E',
      accent: '#BFA8DF',
      accentDark: '#9D7BCE',
      accentDim: '#7A5CA5',
      accentBg: '#251F2E',
      white: '#FFFFFF',
      shadow: '#000000',
    }
  }
};

// For backward compatibility while refactoring, we temporarily expose T
export const T = {
  color: themes.classic.light,
  ...sharedTokens
};


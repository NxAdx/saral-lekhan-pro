import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { argbFromHex, themeFromSourceColor, hexFromArgb } from '@material/material-color-utilities';
import { ThemeColors, sharedTokens, themes } from '../tokens';
import { useSettingsStore } from './settingsStore';

interface ThemeState {
    // We no longer store just a theme name, but the whole generated color set
    // though for persistence we mostly care about the seed and night mode which are in settingsStore.
    // This store will mainly be a derivative of settingsStore + system state.
    colors: ThemeColors;
    setColors: (c: ThemeColors) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
    colors: {} as ThemeColors, // Initial state, will be populated by the hook
    setColors: (c) => set({ colors: c }),
}));

// Helper to generate App ThemeColors from Material Theme
const generateAppColors = (seed: string, isDark: boolean, amoled: boolean): ThemeColors => {
    const theme = themeFromSourceColor(argbFromHex(seed));
    const scheme = isDark ? theme.schemes.dark : theme.schemes.light;

    const colors: ThemeColors = {
        bg: amoled && isDark ? '#000000' : hexFromArgb(scheme.background),
        bgRaised: amoled && isDark ? '#050505' : hexFromArgb(scheme.surface),
        bgDeep: amoled && isDark ? '#0A0A0A' : hexFromArgb(scheme.surfaceVariant),
        stroke: hexFromArgb(scheme.outline),
        strokeDim: hexFromArgb(scheme.outlineVariant),
        ink: hexFromArgb(scheme.onSurface),
        inkMid: hexFromArgb(scheme.onSurfaceVariant),
        inkDim: hexFromArgb(scheme.onSurfaceVariant), // Could add more custom logic here
        accent: hexFromArgb(scheme.primary),
        accentDark: hexFromArgb(scheme.inversePrimary),
        accentDim: hexFromArgb(scheme.primaryContainer),
        accentBg: hexFromArgb(scheme.secondaryContainer),
        white: '#FFFFFF',
        shadow: amoled && isDark ? '#000000' : hexFromArgb(scheme.shadow),
    };

    return colors;
};

export const useTheme = () => {
    const systemColorScheme = useColorScheme();
    const settings = useSettingsStore();

    // Determine actual dark mode state
    const isDark = settings.nightMode === 'system'
        ? (systemColorScheme === 'dark')
        : settings.nightMode === 'dark';

    // Derive colors from preset themes
    const themeEntry = themes[settings.themeId] || themes.classic;
    let colors = { ...(isDark ? themeEntry.dark : themeEntry.light) };

    // Apply AMOLED override if theme is dark
    if (settings.amoledMode && isDark && (settings.themeId === 'pitch' || settings.themeId === 'nord' || settings.themeId === 'classic')) {
        colors.bg = '#000000';
        colors.bgRaised = '#050505';
        colors.bgDeep = '#0A0A0A';
    }

    // Simplified default font stack with dynamic overrides
    const baseSans = {
        sans: 'Hind',
        sansMed: 'Hind-Medium',
        sansSemi: 'Hind-SemiBold',
        sansBold: 'Hind-Bold',
    };

    const baseSerif = {
        sans: 'Playfair',
        sansMed: 'Playfair-Medium',
        sansSemi: 'Playfair-SemiBold',
        sansBold: 'Playfair-Bold',
    };

    const baseMono = {
        sans: 'JetBrains',
        sansMed: 'JetBrains-Medium',
        sansSemi: 'JetBrains-SemiBold',
        sansBold: 'JetBrains-Bold',
    };

    const activeFontSet = settings.appFont === 'serif' ? baseSerif : settings.appFont === 'mono' ? baseMono : baseSans;

    const customFont = {
        ...activeFontSet,
        display: 'VesperLibre-Black',
        mono: 'DMMono-Regular',
    };

    return {
        colors,
        ...sharedTokens,
        font: customFont,
        isDark,
        fontSize: settings.fontSize,
    };
};

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { argbFromHex, themeFromSourceColor, hexFromArgb } from '@material/material-color-utilities';
import { ThemeColors, sharedTokens, themes } from '../tokens';
import { useSettingsStore, AppFontType } from './settingsStore';

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
        inkDim: hexFromArgb(scheme.onSurfaceVariant),
        accent: hexFromArgb(scheme.primary),
        accentDark: hexFromArgb(scheme.inversePrimary),
        accentDim: hexFromArgb(scheme.primaryContainer),
        accentBg: hexFromArgb(scheme.secondaryContainer),
        white: '#FFFFFF',
        shadow: amoled && isDark ? '#000000' : hexFromArgb(scheme.shadow),
        bgHighlight: hexFromArgb(scheme.surfaceVariant),
    };

    return colors as ThemeColors;
};

export const useTheme = () => {
    const systemColorScheme = useColorScheme();
    const settings = useSettingsStore();

    // Determine actual dark mode state
    const isDark = settings.nightMode === 'system'
        ? (systemColorScheme === 'dark')
        : settings.nightMode === 'dark';

    // Derive colors
    const themeEntry = themes[settings.themeId] || themes.classic;
    let colors = { ...(isDark ? themeEntry.dark : themeEntry.light) };

    // Apply AMOLED override for presets if theme is dark
    if (settings.amoledMode && isDark && (settings.themeId === 'pitch' || settings.themeId === 'nord' || settings.themeId === 'classic')) {
        colors.bg = '#000000';
        colors.bgRaised = '#050505';
        colors.bgDeep = '#0A0A0A';
    }

    // Typography Sets
    const getFontSet = (type: AppFontType) => {
        switch (type) {
            case 'poppins':
                return {
                    sans: 'Poppins',
                    sansMed: 'Poppins-Medium',
                    sansSemi: 'Poppins-SemiBold',
                    sansBold: 'Poppins-Bold',
                };
            case 'notoSans':
                return {
                    sans: 'NotoSans',
                    sansMed: 'NotoSans-Medium',
                    sansSemi: 'NotoSans-SemiBold',
                    sansBold: 'NotoSans-Bold',
                };
            case 'baloo2':
                return {
                    sans: 'Baloo2',
                    sansMed: 'Baloo2-Medium',
                    sansSemi: 'Baloo2-SemiBold',
                    sansBold: 'Baloo2-Bold',
                };
            case 'yantramanav':
                return {
                    sans: 'Yantramanav',
                    sansMed: 'Yantramanav-Medium',
                    sansSemi: 'Yantramanav-Medium', // Fallback
                    sansBold: 'Yantramanav-Bold',
                };
            case 'tiro':
                return {
                    sans: 'TiroDevanagari',
                    sansMed: 'TiroDevanagari',
                    sansSemi: 'TiroDevanagari',
                    sansBold: 'TiroDevanagari',
                };
            case 'hind':
            default:
                return {
                    sans: 'Hind',
                    sansMed: 'Hind-Medium',
                    sansSemi: 'Hind-SemiBold',
                    sansBold: 'Hind-Bold',
                };
        }
    };

    // Devanagari script languages need Devanagari-capable fonts
    // Poppins and Yantramanav are Latin-only and cannot render Devanagari glyphs
    const needsDevanagari = ['Hi', 'Mr'].includes(settings.language);
    const isLatinOnlyFont = settings.appFont === 'poppins' || settings.appFont === 'yantramanav';
    const effectiveFont = (needsDevanagari && isLatinOnlyFont) ? 'hind' : settings.appFont;

    const activeFontSet = getFontSet(effectiveFont);

    // Manual scaling factors to ensure visual consistency
    const getScale = (type: AppFontType) => {
        switch (type) {
            case 'poppins': return 0.95;
            case 'baloo2': return 1.05;
            case 'tiro': return 1.15;
            case 'yantramanav': return 1.0;
            case 'notoSans': return 1.0;
            case 'hind': return 1.0;
            default: return 1.0;
        }
    };

    const fontScale = getScale(settings.appFont);

    const customFont = {
        ...activeFontSet,
        display: 'VesperLibre-Black',
        mono: 'DMMono-Regular',
        // Special Marathi branding stack for stability
        branding: settings.appFont === 'tiro' || settings.appFont === 'notoSans' ? activeFontSet.sansBold : 'Hind-Bold',
    };

    return {
        colors,
        ...sharedTokens,
        font: customFont,
        isDark,
        fontSize: settings.fontSize * fontScale,
    };
};

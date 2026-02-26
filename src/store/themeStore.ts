import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { argbFromHex, themeFromSourceColor, hexFromArgb } from '@material/material-color-utilities';
import { ThemeColors, sharedTokens } from '../tokens';
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
        ? systemColorScheme === 'dark'
        : settings.nightMode === 'dark';

    // Generate colors dynamically
    // In a real app, you might memoize this or compute it in an effect
    const colors = generateAppColors(settings.seedColor, isDark, settings.amoledMode);

    // Font override logic
    const base = settings.fontFamily;
    const isVesper = base === 'Vesper Libre';
    const isMono = base === 'DM Mono';

    const customFont = {
        sans: isVesper ? 'VesperLibre-Black' : isMono ? 'DMMono-Regular' : 'Hind',
        sansMed: isVesper ? 'VesperLibre-Black' : isMono ? 'DMMono-Regular' : 'Hind-Medium',
        sansSemi: isVesper ? 'VesperLibre-Black' : isMono ? 'DMMono-Regular' : 'Hind-SemiBold',
        sansBold: isVesper ? 'VesperLibre-Black' : isMono ? 'DMMono-Regular' : 'Hind-Bold',
        display: 'VesperLibre-Black',
        mono: 'DMMono-Regular',
    };

    // Icon Shape Radius calculation
    const getRadiusForShape = (baseRadius: number) => {
        switch (settings.iconShape) {
            case 'circle': return 9999;
            case 'squircle': return baseRadius * 1.5; // Custom squircle logic usually more complex, but we'll approximate
            case 'rounded': return baseRadius;
            default: return baseRadius;
        }
    };

    const dynamicRadius = {
        ...sharedTokens.radius,
        xl: getRadiusForShape(sharedTokens.radius.xl),
        lg: getRadiusForShape(sharedTokens.radius.lg),
        md: getRadiusForShape(sharedTokens.radius.md),
        sm: getRadiusForShape(sharedTokens.radius.sm),
    };

    return {
        colors,
        ...sharedTokens,
        radius: dynamicRadius,
        font: customFont,
        isDark,
    };
};

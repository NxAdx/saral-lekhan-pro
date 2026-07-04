import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { shallow } from 'zustand/shallow';
import { sharedTokens, themes } from '../tokens';
import { useSettingsStore, AppFontType, normalizeAppFont } from './settingsStore';
import { FONT_SCALES, resolveEffectiveAppFont } from '../constants/fontConfig';

type ThemeValue = {
    colors: (typeof themes)[keyof typeof themes]['light'];
    spacing: typeof sharedTokens.spacing;
    radius: typeof sharedTokens.radius;
    shadow: typeof sharedTokens.shadow;
    strokeWidth: typeof sharedTokens.strokeWidth;
    typography: typeof sharedTokens.typography;
    font: {
        sans: string;
        sansMed: string;
        sansSemi: string;
        sansBold: string;
        display: string;
        mono: string;
        branding: string;
    };
    isDark: boolean;
    fontSize: number;
};

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

export const useTheme = () => {
    const systemColorScheme = useColorScheme();
    const { nightMode, themeId, language, appFont, fontSize, highContrast } = useSettingsStore(
        (s) => ({
            nightMode: s.nightMode,
            themeId: s.themeId,
            language: s.language,
            appFont: s.appFont,
            fontSize: s.fontSize,
            highContrast: s.highContrast,
        }),
        shallow
    );

    // Determine actual dark mode state
    const isDark = nightMode === 'system'
        ? (systemColorScheme === 'dark')
        : nightMode === 'dark';

    // Drive colors
    const colors = useMemo(() => {
        const themeEntry = themes[themeId] || themes.classic;
        const c = { ...(isDark ? themeEntry.dark : themeEntry.light) };
        
        if (highContrast) {
            c.inkDim = isDark ? '#F5F5F5' : '#111111';
            c.inkMid = isDark ? '#FAFAFA' : '#0A0A0A';
            c.ink = isDark ? '#FFFFFF' : '#000000';
            c.stroke = isDark ? '#888888' : '#777777';
            c.strokeDim = isDark ? '#666666' : '#999999';
        }
        
        return c;
    }, [themeId, isDark, highContrast]);

    const normalizedFont = normalizeAppFont(appFont);
    const effectiveFont = resolveEffectiveAppFont(normalizedFont, language);
    const activeFontSet = useMemo(() => getFontSet(effectiveFont), [effectiveFont]);
    const fontScale = FONT_SCALES[effectiveFont] || 1.0;

    const customFont = useMemo(() => ({
        ...activeFontSet,
        // Keep legacy token names but map them to the active UI family.
        display: activeFontSet.sansBold,
        mono: activeFontSet.sansMed,
        branding: 'Hind-Bold',
    }), [activeFontSet]);

    return useMemo<ThemeValue>(() => ({
        colors,
        ...sharedTokens,
        font: customFont,
        isDark,
        fontSize: (fontSize || 1.0) * fontScale,
    }), [colors, customFont, isDark, fontSize, fontScale]);
};

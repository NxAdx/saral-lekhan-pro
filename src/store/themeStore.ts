import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { shallow } from 'zustand/shallow';
import { sharedTokens, themes } from '../tokens';
import { useSettingsStore, AppFontType } from './settingsStore';
import { FONT_SCALES, resolveEffectiveAppFont } from '../constants/fontConfig';

type ThemeValue = {
    colors: (typeof themes)[keyof typeof themes]['light'];
    spacing: typeof sharedTokens.spacing;
    radius: typeof sharedTokens.radius;
    shadow: typeof sharedTokens.shadow;
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
        case 'yantramanav':
            return {
                sans: 'Yantramanav',
                sansMed: 'Yantramanav-Medium',
                sansSemi: 'Yantramanav-Medium',
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

export const useTheme = () => {
    const systemColorScheme = useColorScheme();
    const { nightMode, themeId, language, appFont, fontSize } = useSettingsStore(
        (s) => ({
            nightMode: s.nightMode,
            themeId: s.themeId,
            language: s.language,
            appFont: s.appFont,
            fontSize: s.fontSize,
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
        return { ...(isDark ? themeEntry.dark : themeEntry.light) };
    }, [themeId, isDark]);

    const effectiveFont = resolveEffectiveAppFont(appFont, language);
    const activeFontSet = useMemo(() => getFontSet(effectiveFont), [effectiveFont]);
    const fontScale = FONT_SCALES[appFont] || 1.0;

    const customFont = useMemo(() => ({
        ...activeFontSet,
        display: 'VesperLibre-Black',
        mono: 'DMMono-Regular',
        // Marathi and Devanagari-oriented layouts remain stable with these families.
        branding: appFont === 'tiro' || appFont === 'notoSans' ? activeFontSet.sansBold : 'Hind-Bold',
    }), [activeFontSet, appFont]);

    return useMemo<ThemeValue>(() => ({
        colors,
        ...sharedTokens,
        font: customFont,
        isDark,
        fontSize: fontSize * fontScale,
    }), [colors, customFont, isDark, fontSize, fontScale]);
};

import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { useSettingsStore } from '../store/settingsStore';
import { sharedTokens } from '../tokens';
import { FONT_SCALES, getEffectiveAppFont } from '../constants/fontConfig';

export const useTypography = () => {
    const { fontSize, appFont, language } = useSettingsStore(
        (s) => ({ fontSize: s.fontSize, appFont: s.appFont, language: s.language }),
        shallow
    );

    const type = useMemo(() => {
        const effectiveFont = getEffectiveAppFont(appFont, language);
        const scale = FONT_SCALES[effectiveFont] || 1.0;
        const baseMultiplier = fontSize * scale;

        return {
            displayLarge: {
                fontSize: sharedTokens.typography.displayLarge.size * baseMultiplier,
                fontWeight: sharedTokens.typography.headlineLarge.weight as any,
                includeFontPadding: false,
            },
            headlineLarge: {
                fontSize: sharedTokens.typography.headlineLarge.size * baseMultiplier,
                fontWeight: sharedTokens.typography.headlineLarge.weight as any,
                includeFontPadding: false,
            },
            titleLarge: {
                fontSize: sharedTokens.typography.titleLarge.size * baseMultiplier,
                fontWeight: sharedTokens.typography.titleLarge.weight as any,
                includeFontPadding: false,
            },
            bodyLarge: {
                fontSize: sharedTokens.typography.bodyLarge.size * baseMultiplier,
                fontWeight: sharedTokens.typography.bodyLarge.weight as any,
                includeFontPadding: false,
            },
            labelMedium: {
                fontSize: sharedTokens.typography.labelMedium.size * baseMultiplier,
                fontWeight: sharedTokens.typography.labelMedium.weight as any,
                includeFontPadding: false,
            },
            bodySmall: {
                fontSize: 11 * baseMultiplier,
                fontWeight: '400' as any,
                includeFontPadding: false,
            },
            labelSmall: {
                fontSize: 10 * baseMultiplier,
                fontWeight: '500' as any,
                includeFontPadding: false,
            }
        };
    }, [fontSize, appFont, language]);

    return type;
};

import { useMemo } from 'react';
import { useSettingsStore, AppFontType } from '../store/settingsStore';
import { sharedTokens } from '../tokens';

const FONT_SCALES: Record<AppFontType, number> = {
    hind: 1.0,
    poppins: 0.96,
    notoSans: 1.0,
    baloo2: 1.02,
    yantramanav: 1.0,
    tiro: 1.12,
};

export const useTypography = () => {
    const { fontSize, appFont } = useSettingsStore();

    const type = useMemo(() => {
        const scale = FONT_SCALES[appFont] || 1.0;
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
    }, [fontSize, appFont]);

    return type;
};

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
                fontWeight: sharedTokens.typography.displayLarge.weight as any,
            },
            headlineLarge: {
                fontSize: sharedTokens.typography.headlineLarge.size * baseMultiplier,
                fontWeight: sharedTokens.typography.headlineLarge.weight as any,
            },
            titleLarge: {
                fontSize: sharedTokens.typography.titleLarge.size * baseMultiplier,
                fontWeight: sharedTokens.typography.titleLarge.weight as any,
            },
            bodyLarge: {
                fontSize: sharedTokens.typography.bodyLarge.size * baseMultiplier,
                fontWeight: sharedTokens.typography.bodyLarge.weight as any,
            },
            labelMedium: {
                fontSize: sharedTokens.typography.labelMedium.size * baseMultiplier,
                fontWeight: sharedTokens.typography.labelMedium.weight as any,
            },
            bodySmall: {
                fontSize: 11 * baseMultiplier,
                fontWeight: '400' as any,
            },
            labelSmall: {
                fontSize: 10 * baseMultiplier,
                fontWeight: '500' as any,
            }
        };
    }, [fontSize, appFont]);

    return type;
};

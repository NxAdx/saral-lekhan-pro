import { AppFontType, AppLanguage, normalizeAppFont } from '../store/settingsStore';

export const FONT_SCALES: Record<AppFontType, number> = {
    hind: 1.0,
    poppins: 0.96,
    notoSans: 1.0,
    baloo2: 1.01,
};

const DEVANAGARI_LANGUAGES: readonly AppLanguage[] = ['Hi', 'Mr'];
const DEVANAGARI_SENSITIVE_FONTS: readonly AppFontType[] = ['poppins'];

export function getEffectiveAppFont(appFont: string, language: AppLanguage): AppFontType {
    const normalizedFont = normalizeAppFont(appFont);
    const needsDevanagari = DEVANAGARI_LANGUAGES.includes(language);
    const isSensitiveFont = DEVANAGARI_SENSITIVE_FONTS.includes(normalizedFont);
    return needsDevanagari && isSensitiveFont ? 'hind' : normalizedFont;
}

export function resolveEffectiveAppFont(appFont: AppFontType, language: AppLanguage): AppFontType {
    return getEffectiveAppFont(appFont, language);
}

import { AppFontType, AppLanguage, normalizeAppFont } from '../store/settingsStore';

export const FONT_SCALES: Record<AppFontType, number> = {
    hind: 0.98,
    poppins: 1.0,
    notoSans: 1.0,
    baloo2: 0.95,
};

const DEVANAGARI_LANGUAGES: readonly AppLanguage[] = ['Hi', 'Mr'];
const DEVANAGARI_SENSITIVE_FONTS: readonly AppFontType[] = ['poppins', 'notoSans'];

export function getEffectiveAppFont(appFont: string, language: AppLanguage): AppFontType {
    const normalizedFont = normalizeAppFont(appFont);
    const needsDevanagari = DEVANAGARI_LANGUAGES.includes(language);
    const isSensitiveFont = DEVANAGARI_SENSITIVE_FONTS.includes(normalizedFont);
    return needsDevanagari && isSensitiveFont ? 'hind' : normalizedFont;
}

export function resolveEffectiveAppFont(appFont: AppFontType, language: AppLanguage): AppFontType {
    return getEffectiveAppFont(appFont, language);
}

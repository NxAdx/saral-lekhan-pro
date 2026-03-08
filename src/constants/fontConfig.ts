import { AppFontType, AppLanguage } from '../store/settingsStore';

export const FONT_SCALES: Record<AppFontType, number> = {
    hind: 1.0,
    poppins: 0.96,
    notoSans: 1.0,
    baloo2: 1.02,
    yantramanav: 1.0,
    tiro: 1.12,
};

const DEVANAGARI_LANGUAGES: readonly AppLanguage[] = ['Hi', 'Mr'];
const LATIN_ONLY_FONTS: readonly AppFontType[] = ['poppins', 'yantramanav'];

export function resolveEffectiveAppFont(appFont: AppFontType, language: AppLanguage): AppFontType {
    const needsDevanagari = DEVANAGARI_LANGUAGES.includes(language);
    const isLatinOnlyFont = LATIN_ONLY_FONTS.includes(appFont);
    return needsDevanagari && isLatinOnlyFont ? 'hind' : appFont;
}

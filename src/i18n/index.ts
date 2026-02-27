import { useSettingsStore } from '../store/settingsStore';
import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';

const translations: Record<string, any> = {
    En: en,
    Hi: hi,
    Bn: bn,
    Te: te,
    Mr: mr,
    Ta: ta,
};

export type AppStrings = typeof en;

/**
 * Mihon-style Scalable i18n System
 * This utility allows for easy community translation by splitting
 * strings into individual JSON files while maintaining a simple API for the app.
 */
export const getStrings = (lang: string) => {
    return translations[lang] || translations.En;
};

// Hook for components to use strings reactively
export const useStrings = () => {
    const language = useSettingsStore((state) => state.language);
    return getStrings(language);
};

// Legacy support for direct import (will non-reactively use the current store value)
// Note: Using this outside of hooks/loops is preferred to minimize code changes.
export const strings = new Proxy({}, {
    get(_, prop) {
        const language = useSettingsStore.getState().language;
        const currentStrings = getStrings(language);
        return currentStrings[prop];
    }
}) as any;

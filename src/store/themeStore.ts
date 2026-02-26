import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, ThemeColors, themes, sharedTokens } from '../tokens';

interface ThemeState {
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
    // Computed properties for easy access
    colors: ThemeColors;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            themeName: 'classic',
            colors: themes.classic,
            setTheme: (name: ThemeName) => set({ themeName: name, colors: themes[name] }),
        }),
        {
            name: 'saral-lekhan-theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only serialize the theme name to keep storage light.
            // Rehydrate `colors` from the `themes` object on load.
            partialize: (state) => ({ themeName: state.themeName }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.colors = themes[state.themeName] || themes.classic;
                }
            }
        }
    )
);

import { useSettingsStore } from './settingsStore';

// A handy hook wrapper to get colors and shared tokens simultaneously
export const useTheme = () => {
    const { themeName, colors, setTheme } = useThemeStore();
    const settings = useSettingsStore();

    // 1. Pure Black override
    const finalColors = { ...colors };
    if (settings.pureBlack && (themeName === 'nord' || themeName === 'mocha')) {
        finalColors.bg = '#000000';
        finalColors.bgRaised = '#0A0A0A';
        finalColors.bgDeep = '#141414';
    } else if (settings.pureBlack && themeName === 'amoled') {
        // already pure black
    } else if (settings.pureBlack && (themeName === 'classic' || themeName === 'lavender')) {
        // ignore pure black for light themes 
    }

    // 2. Font override
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

    return {
        themeName,
        setTheme,
        colors: finalColors,
        ...sharedTokens,
        font: customFont
    };
};

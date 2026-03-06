import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../tokens';

export type AppLanguage = 'En' | 'Hi' | 'Bn' | 'Te' | 'Mr' | 'Ta';
export type NightMode = 'system' | 'light' | 'dark';
export type AppFontType = 'hind' | 'poppins' | 'notoSans' | 'baloo2' | 'yantramanav' | 'tiro';

interface SettingsState {
    language: AppLanguage;
    nightMode: NightMode;
    themeId: ThemeName;
    fontSize: number;
    appFont: AppFontType;
    autoSave: boolean;

    setLanguage: (l: AppLanguage) => void;
    setNightMode: (m: NightMode) => void;
    setThemeId: (i: ThemeName) => void;
    setFontSize: (s: number) => void;
    setAppFont: (f: AppFontType) => void;
    setAutoSave: (b: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'Hi',
            nightMode: 'system',
            themeId: 'classic',
            fontSize: 1.0,
            appFont: 'poppins',
            autoSave: true,

            setLanguage: (l) => set({ language: l }),
            setNightMode: (m) => set({ nightMode: m }),
            setThemeId: (i) => {
                // Migration: if the theme was pitch (which is being removed), reset to classic
                const newTheme = i === ('pitch' as ThemeName) ? 'classic' : i;
                set({ themeId: newTheme as ThemeName });
            },
            setFontSize: (s) => set({ fontSize: s }),
            setAppFont: (f) => set({ appFont: f }),
            setAutoSave: (b) => set({ autoSave: b }),
        }),
        {
            name: 'saral-lekhan-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

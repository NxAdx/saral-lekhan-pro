import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName } from '../tokens';

export type AppLanguage = 'En' | 'Hi' | 'Bn' | 'Te' | 'Mr' | 'Ta';
export type NightMode = 'system' | 'light' | 'dark';
export type AppFontType = 'sans' | 'serif' | 'mono';

interface SettingsState {
    language: AppLanguage;
    nightMode: NightMode;
    amoledMode: boolean;
    themeId: ThemeName;
    dynamicColors: boolean;
    fontSize: number;
    appFont: AppFontType;

    setLanguage: (l: AppLanguage) => void;
    setNightMode: (m: NightMode) => void;
    setAmoledMode: (b: boolean) => void;
    setThemeId: (i: ThemeName) => void;
    setDynamicColors: (d: boolean) => void;
    setFontSize: (s: number) => void;
    setAppFont: (f: AppFontType) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: 'Hi',
            nightMode: 'system',
            amoledMode: false,
            themeId: 'classic',
            dynamicColors: false,
            fontSize: 1.0,
            appFont: 'sans',

            setLanguage: (l) => set({ language: l }),
            setNightMode: (m) => set({ nightMode: m }),
            setAmoledMode: (b) => set({ amoledMode: b }),
            setThemeId: (i) => set({ themeId: i }),
            setDynamicColors: (d) => set({ dynamicColors: d }),
            setFontSize: (s) => set({ fontSize: s }),
            setAppFont: (f) => set({ appFont: f }),
        }),
        {
            name: 'saral-lekhan-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

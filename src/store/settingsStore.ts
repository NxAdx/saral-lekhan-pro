import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontFamily = 'Hind' | 'Vesper Libre' | 'DM Mono';
export type AppLanguage = 'En' | 'Hi' | 'Bn' | 'Te' | 'Mr' | 'Ta';
export type NightMode = 'system' | 'light' | 'dark';
export type IconShape = 'circle' | 'squircle' | 'rounded';

interface SettingsState {
    fontFamily: FontFamily;
    language: AppLanguage;
    nightMode: NightMode;
    amoledMode: boolean;
    seedColor: string;
    iconShape: IconShape;
    dynamicColors: boolean;

    setFontFamily: (f: FontFamily) => void;
    setLanguage: (l: AppLanguage) => void;
    setNightMode: (m: NightMode) => void;
    setAmoledMode: (b: boolean) => void;
    setSeedColor: (c: string) => void;
    setIconShape: (s: IconShape) => void;
    setDynamicColors: (d: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            fontFamily: 'Hind',
            language: 'Hi',
            nightMode: 'system',
            amoledMode: false,
            seedColor: '#FF5722', // Default Tippani orange equivalent
            iconShape: 'rounded',
            dynamicColors: false,

            setFontFamily: (f) => set({ fontFamily: f }),
            setLanguage: (l) => set({ language: l }),
            setNightMode: (m) => set({ nightMode: m }),
            setAmoledMode: (b) => set({ amoledMode: b }),
            setSeedColor: (c) => set({ seedColor: c }),
            setIconShape: (s) => set({ iconShape: s }),
            setDynamicColors: (d) => set({ dynamicColors: d }),
        }),
        {
            name: 'saral-lekhan-settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
